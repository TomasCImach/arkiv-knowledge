'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { createPage } from '@/arkiv/mutations/pages'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { slugify } from '@/lib/text'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

export type CreatePageFormProps = {
  spaceKey: Hex
  spaceSlug: string
}

export function CreatePageForm({ spaceKey, spaceSlug }: CreatePageFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [title, setTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !address || !isConnected) {
      setStatusText('Connect wallet to create pages.')
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setStatusText(preflight.message)
      return
    }

    const finalSlug = slugify(pageSlug || title)
    if (!finalSlug) {
      setStatusText('Provide a valid page slug or title.')
      return
    }

    setPending(true)
    setStatusText('')

    try {
      const result = await createPage(walletClient, {
        spaceKey,
        spaceSlug,
        pageSlug: finalSlug,
        title,
        summary,
        status,
        bodyMarkdown,
        editor: address
      })
      setStatusText(`Created page ${result.pageKey.slice(0, 10)}...`)
      router.push(`/spaces/${spaceSlug}/${finalSlug}`)
      router.refresh()
    } catch (error) {
      console.error('create-page failed', error)
      setStatusText(formatWalletError(error, 'Failed to create page.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Create Page</h1>
      <p className="subtitle">This writes canonical page + revision entities to Arkiv.</p>

      <label>
        Title
        <input required value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label>
        Page slug
        <input value={pageSlug} onChange={(event) => setPageSlug(event.target.value)} placeholder="getting-started" />
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
        Markdown body
        <textarea
          required
          value={bodyMarkdown}
          onChange={(event) => setBodyMarkdown(event.target.value)}
          placeholder="Write docs and link with [[other-page]]"
        />
      </label>

      <div className="toolbar">
        <input type="submit" disabled={pending} value={pending ? 'Saving...' : 'Create Page'} />
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>
    </form>
  )
}
