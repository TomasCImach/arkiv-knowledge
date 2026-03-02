'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { MarkdownEditorField } from '@/app/_components/markdown-editor-field'
import { editPage } from '@/arkiv/mutations/pages'
import type { ParsedPage } from '@/arkiv/types'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { useUnsavedChangesGuard } from '@/features/forms/useUnsavedChangesGuard'
import { collectDescendantKeys, listPagesInTreeOrder } from '@/features/hierarchy/tree'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'
import { TechnicalDetails } from '@/app/_components/technical-details'

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
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    title: page.payload.title,
    summary: page.payload.summary,
    status: page.status,
    bodyMarkdown: page.payload.bodyMarkdown,
    editSummary: 'Content update',
    parentPageKey: page.parentPageKey ?? ''
  }))
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
  const isDirty =
    title !== savedSnapshot.title ||
    summary !== savedSnapshot.summary ||
    status !== savedSnapshot.status ||
    bodyMarkdown !== savedSnapshot.bodyMarkdown ||
    editSummary !== savedSnapshot.editSummary ||
    parentPageKey !== savedSnapshot.parentPageKey

  useUnsavedChangesGuard(isDirty && !pending)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !address || !isConnected) {
      setFeedback({ tone: 'error', text: 'Connect wallet to update pages.' })
      return
    }

    if (!isOwner) {
      setFeedback({ tone: 'error', text: 'Only owner can update this page.' })
      return
    }

    if (parentPageKey) {
      const selectedParent = parentPageKey as Hex
      if (invalidParentKeys.has(selectedParent) || !parentOptionKeys.has(selectedParent)) {
        setFeedback({ tone: 'error', text: 'Invalid parent selection. Refresh and choose a different parent.' })
        return
      }
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setFeedback({ tone: 'error', text: preflight.message })
      return
    }

    setPending(true)
    setFeedback(null)

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

      setFeedback({ tone: 'success', text: `Saved (${result.txHash.slice(0, 10)}...). Choose what to do next.` })
      setSavedSnapshot({
        title,
        summary,
        status,
        bodyMarkdown,
        editSummary,
        parentPageKey
      })
      router.refresh()
    } catch (error) {
      console.error('edit-page failed', error)
      setFeedback({ tone: 'error', text: formatWalletError(error, 'Failed to save page.') })
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Edit Page</h1>
      <p className="subtitle">Update page content and structure. Only the owner wallet can save changes.</p>
      <TechnicalDetails summary="Technical details (write path)">
        <p className="subtitle">Save uses an Arkiv mutate flow: update canonical page, append revision, and rewrite page links.</p>
      </TechnicalDetails>

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

      <MarkdownEditorField value={bodyMarkdown} onChange={setBodyMarkdown} />

      {feedback ? (
        <div className={`form-callout ${feedback.tone === 'success' ? 'success' : 'error'}`}>
          <p className="subtitle">{feedback.text}</p>
          {feedback.tone === 'success' ? (
            <div className="toolbar form-callout-actions">
              <Link href={`/spaces/${spaceSlug}/${page.pageSlug}`} className="button secondary">
                Open page
              </Link>
              <Link href={`/spaces/${spaceSlug}`} className="button secondary">
                Back to space
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="toolbar">
        <input type="submit" disabled={!canSubmit} value={pending ? 'Saving...' : 'Save Page'} />
      </div>
      {!isConnected ? <p className="subtitle">Connect the owner wallet to continue.</p> : null}
      {isConnected && !isOwner ? <p className="subtitle">Switch to the owner wallet to continue.</p> : null}
    </form>
  )
}
