'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { editPage } from '@/arkiv/mutations/pages'
import type { ParsedPage } from '@/arkiv/types'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { collectDescendantKeys, listPagesInTreeOrder } from '@/features/hierarchy/tree'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

export type EditPageFormProps = {
  spaceKey: Hex
  spaceSlug: string
  page: ParsedPage
  availableParents: ParsedPage[]
}

export function EditPageForm({ spaceKey, spaceSlug, page, availableParents }: EditPageFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [title, setTitle] = useState(page.payload.title)
  const [summary, setSummary] = useState(page.payload.summary)
  const [status, setStatus] = useState(page.status)
  const [bodyMarkdown, setBodyMarkdown] = useState(page.payload.bodyMarkdown)
  const [editSummary, setEditSummary] = useState('Content update')
  const [parentPageKey, setParentPageKey] = useState(page.parentPageKey ?? '')
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)
  const isOwner = canManageOwnedEntity(page.owner, address)
  const canSubmit = Boolean(walletClient && address && isConnected && isOwner && !pending)

  const invalidParentKeys = useMemo(() => {
    const descendants = collectDescendantKeys(availableParents, page.entityKey)
    return new Set<Hex>([page.entityKey, ...descendants])
  }, [availableParents, page.entityKey])

  const parentOptions = useMemo(() => {
    return listPagesInTreeOrder(availableParents).filter(({ page: candidate }) => !invalidParentKeys.has(candidate.entityKey))
  }, [availableParents, invalidParentKeys])

  const parentOptionKeys = useMemo(() => {
    return new Set(parentOptions.map(({ page: candidate }) => candidate.entityKey))
  }, [parentOptions])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !address || !isConnected) {
      setStatusText('Connect wallet to update pages.')
      return
    }

    if (!isOwner) {
      setStatusText('Only owner can update this page.')
      return
    }

    if (parentPageKey) {
      const selectedParent = parentPageKey as Hex
      if (invalidParentKeys.has(selectedParent) || !parentOptionKeys.has(selectedParent)) {
        setStatusText('Invalid parent selection. Refresh and choose a different parent.')
        return
      }
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
        editSummary,
        createdAt: page.payload.createdAt,
        parentPageKey: parentPageKey ? (parentPageKey as Hex) : undefined
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
        Parent page
        <select value={parentPageKey} onChange={(event) => setParentPageKey(event.target.value)}>
          <option value="">Root (no parent)</option>
          {parentPageKey && !parentOptionKeys.has(parentPageKey as Hex) ? (
            <option value={parentPageKey}>Invalid parent (refresh required)</option>
          ) : null}
          {parentOptions.map(({ page: candidate, depth }) => (
            <option key={candidate.entityKey} value={candidate.entityKey}>
              {`${'-- '.repeat(depth)}${candidate.payload.title}`}
            </option>
          ))}
        </select>
      </label>

      <label>
        Markdown body
        <textarea required value={bodyMarkdown} onChange={(event) => setBodyMarkdown(event.target.value)} />
      </label>

      <div className="toolbar">
        <input type="submit" disabled={!canSubmit} value={pending ? 'Saving...' : 'Save Page'} />
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>
      {!isConnected ? <p className="subtitle">Connect wallet to update pages.</p> : null}
      {isConnected && !isOwner ? <p className="subtitle">Only owner can update this page.</p> : null}
    </form>
  )
}
