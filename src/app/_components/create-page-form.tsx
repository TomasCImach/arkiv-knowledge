'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { MarkdownEditorField } from '@/app/_components/markdown-editor-field'
import { createPage } from '@/arkiv/mutations/pages'
import type { ParsedPage } from '@/arkiv/types'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { useUnsavedChangesGuard } from '@/features/forms/useUnsavedChangesGuard'
import { listPagesInTreeOrder } from '@/features/hierarchy/tree'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { slugify } from '@/lib/text'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'
import { TechnicalDetails } from '@/app/_components/technical-details'

export type CreatePageFormProps = {
  spaceKey: Hex
  spaceSlug: string
  spaceOwner: Hex | undefined
  availableParents: ParsedPage[]
}

export function CreatePageForm({ spaceKey, spaceSlug, spaceOwner, availableParents }: CreatePageFormProps) {
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [title, setTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [parentPageKey, setParentPageKey] = useState('')
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [createdPageSlug, setCreatedPageSlug] = useState('')
  const [pending, setPending] = useState(false)
  const parentOptions = listPagesInTreeOrder(availableParents)
  const isSpaceOwner = canManageOwnedEntity(spaceOwner, address)
  const canSubmit = Boolean(walletClient && isConnected && address && isSpaceOwner && !pending)
  const isDirty =
    title.trim().length > 0 ||
    pageSlug.trim().length > 0 ||
    summary.trim().length > 0 ||
    bodyMarkdown.trim().length > 0 ||
    parentPageKey.length > 0 ||
    status !== 'published'

  useUnsavedChangesGuard(isDirty && !pending)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !address || !isConnected) {
      setFeedback({ tone: 'error', text: 'Connect wallet to create pages.' })
      return
    }

    if (!isSpaceOwner) {
      setFeedback({ tone: 'error', text: 'Only owner can create pages in this space.' })
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setFeedback({ tone: 'error', text: preflight.message })
      return
    }

    const finalSlug = slugify(pageSlug || title)
    if (!finalSlug) {
      setFeedback({ tone: 'error', text: 'Provide a valid page slug or title.' })
      return
    }

    setPending(true)
    setFeedback(null)
    setCreatedPageSlug('')

    try {
      await createPage(walletClient, {
        spaceKey,
        spaceSlug,
        pageSlug: finalSlug,
        title,
        summary,
        status,
        bodyMarkdown,
        editor: address,
        parentPageKey: parentPageKey ? (parentPageKey as Hex) : undefined
      })
      setFeedback({ tone: 'success', text: 'Page created successfully. Choose what to do next.' })
      setCreatedPageSlug(finalSlug)
      setTitle('')
      setPageSlug('')
      setSummary('')
      setStatus('published')
      setBodyMarkdown('')
      setParentPageKey('')
    } catch (error) {
      console.error('create-page failed', error)
      setFeedback({ tone: 'error', text: formatWalletError(error, 'Failed to create page.') })
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Create Page</h1>
      <p className="subtitle">Create a page in this space. Only the owner wallet can publish changes.</p>
      <TechnicalDetails summary="Technical details (write path)">
        <p className="subtitle">Submitting creates/updates canonical `kb.page` data and appends a `kb.revision` entry.</p>
      </TechnicalDetails>

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
        Parent page
        <select value={parentPageKey} onChange={(event) => setParentPageKey(event.target.value)}>
          <option value="">Root (no parent)</option>
          {parentOptions.map(({ page, depth }) => (
            <option key={page.entityKey} value={page.entityKey}>
              {`${'-- '.repeat(depth)}${page.payload.title}`}
            </option>
          ))}
        </select>
      </label>

      <MarkdownEditorField
        value={bodyMarkdown}
        onChange={setBodyMarkdown}
        placeholder="Write docs and link with [[other-page]]"
      />

      {feedback ? (
        <div className={`form-callout ${feedback.tone === 'success' ? 'success' : 'error'}`}>
          <p className="subtitle">{feedback.text}</p>
          {feedback.tone === 'success' && createdPageSlug ? (
            <div className="toolbar form-callout-actions">
              <Link href={`/spaces/${spaceSlug}/${createdPageSlug}`} className="button secondary">
                Open page
              </Link>
              <Link href={`/spaces/${spaceSlug}`} className="button secondary">
                Back to space
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="toolbar form-actions mobile-action-bar">
        <input type="submit" disabled={!canSubmit} value={pending ? 'Saving...' : 'Create Page'} />
      </div>
      {!isConnected ? <p className="subtitle">Connect the owner wallet to continue.</p> : null}
      {isConnected && !isSpaceOwner ? <p className="subtitle">Switch to the owner wallet to continue.</p> : null}
    </form>
  )
}
