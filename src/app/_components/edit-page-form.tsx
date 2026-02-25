'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { editPage } from '@/arkiv/mutations/pages'
import type { ParsedPage } from '@/arkiv/types'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

export type EditPageFormProps = {
  spaceKey: Hex
  spaceSlug: string
  page: ParsedPage
}

export function EditPageForm({ spaceKey, spaceSlug, page }: EditPageFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [title, setTitle] = useState(page.payload.title)
  const [summary, setSummary] = useState(page.payload.summary)
  const [status, setStatus] = useState(page.status)
  const [bodyMarkdown, setBodyMarkdown] = useState(page.payload.bodyMarkdown)
  const [editSummary, setEditSummary] = useState('Content update')
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !address || !isConnected) {
      setStatusText('Connect wallet to update pages.')
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setStatusText(preflight.message)
      return
    }

    setPending(true)
    setStatusText('')

    try {
      const result = await editPage(walletClient, {
        spaceKey,
        spaceSlug,
        pageKey: page.entityKey,
        pageSlug: page.pageSlug,
        title,
        summary,
        status,
        bodyMarkdown,
        editor: address,
        editSummary
      })

      setStatusText(`Saved (${result.txHash.slice(0, 10)}...)`)
      router.push(`/spaces/${spaceSlug}/${page.pageSlug}`)
      router.refresh()
    } catch (error) {
      console.error('edit-page failed', error)
      setStatusText(formatWalletError(error, 'Failed to save page.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Edit Page</h1>
      <p className="subtitle">Uses Arkiv mutate flow: update canonical + create revision + rewrite links.</p>

      <label>
        Title
        <input required value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label>
        Summary
        <input required value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>

      <label>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label>
        Edit summary
        <input required value={editSummary} onChange={(event) => setEditSummary(event.target.value)} />
      </label>

      <label>
        Markdown body
        <textarea required value={bodyMarkdown} onChange={(event) => setBodyMarkdown(event.target.value)} />
      </label>

      <div className="toolbar">
        <input type="submit" disabled={pending} value={pending ? 'Saving...' : 'Save Page'} />
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>
    </form>
  )
}
