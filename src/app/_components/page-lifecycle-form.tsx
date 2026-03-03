'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ParsedPage } from '@/arkiv/types'
import { archivePage, deletePageWithCleanup } from '@/arkiv/mutations/pages'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'
import { useAccount } from 'wagmi'
import { TechnicalDetails } from '@/app/_components/technical-details'

type PageLifecycleFormProps = {
  page: ParsedPage
  viewer?: string
}

function withViewer(value: string, viewer: string | undefined): string {
  if (!viewer) {
    return value
  }

  return `${value}${value.includes('?') ? '&' : '?'}viewer=${viewer}`
}

export function PageLifecycleForm({ page, viewer }: PageLifecycleFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [statusText, setStatusText] = useState('')
  const [archivePending, setArchivePending] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [confirmSlug, setConfirmSlug] = useState('')

  const isOwner = useMemo(() => canManageOwnedEntity(page.owner, address), [address, page.owner])
  const canArchive = Boolean(walletClient && isConnected && address && isOwner && !archivePending && !deletePending)
  const canDelete =
    Boolean(walletClient && isConnected && address && isOwner && !archivePending && !deletePending) &&
    confirmSlug.trim() === page.pageSlug

  async function onArchive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !isConnected || !address) {
      setStatusText('Connect wallet to archive this page.')
      return
    }
    if (!isOwner) {
      setStatusText('Only owner can archive this page.')
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setStatusText(preflight.message)
      return
    }

    setArchivePending(true)
    setStatusText('')
    try {
      const result = await archivePage(walletClient, {
        spaceKey: page.spaceKey,
        spaceSlug: page.spaceSlug,
        pageKey: page.entityKey,
        pageSlug: page.pageSlug,
        title: page.payload.title,
        bodyMarkdown: page.payload.bodyMarkdown,
        summary: page.payload.summary,
        editor: address,
        parentPageKey: page.parentPageKey,
        createdAt: page.payload.createdAt
      })
      setStatusText(`Archived (${result.txHash.slice(0, 10)}...)`)
      router.refresh()
    } catch (error) {
      console.error('archive-page failed', error)
      setStatusText(formatWalletError(error, 'Failed to archive page.'))
    } finally {
      setArchivePending(false)
    }
  }

  async function onDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !isConnected || !address) {
      setStatusText('Connect wallet to delete this page.')
      return
    }
    if (!isOwner) {
      setStatusText('Only owner can delete this page.')
      return
    }
    if (confirmSlug.trim() !== page.pageSlug) {
      setStatusText('Type the exact page slug to confirm delete.')
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setStatusText(preflight.message)
      return
    }

    setDeletePending(true)
    setStatusText('')
    try {
      const result = await deletePageWithCleanup(walletClient, page.entityKey)
      setStatusText(
        `Deleted (${result.txHash.slice(0, 10)}...) links=${result.deletedCounts.links}, revisions=${result.deletedCounts.revisions}, presence=${result.deletedCounts.presence}`
      )
      router.push(withViewer(`/spaces/${page.spaceSlug}`, viewer))
      router.refresh()
    } catch (error) {
      console.error('delete-page failed', error)
      setStatusText(formatWalletError(error, 'Failed to delete page.'))
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="card stack">
      <h3 style={{ margin: 0 }}>Page Lifecycle</h3>
      <p className="subtitle">Archive or delete this page. Only the owner wallet can run lifecycle actions.</p>
      <TechnicalDetails summary="Technical details (lifecycle semantics)">
        <p className="subtitle">Archive keeps revision history; delete removes canonical page plus linked `kb.link`, `kb.presence`, and `kb.revision` entities.</p>
      </TechnicalDetails>

      <form onSubmit={onArchive}>
        <div className="toolbar">
          <input type="submit" value={archivePending ? 'Archiving...' : 'Archive Page'} disabled={!canArchive} />
        </div>
      </form>

      <form onSubmit={onDelete}>
        <label>
          Confirm delete (type slug: <code>{page.pageSlug}</code>)
          <input
            value={confirmSlug}
            onChange={(event) => setConfirmSlug(event.target.value)}
            placeholder={page.pageSlug}
            readOnly={!isOwner || deletePending || archivePending}
          />
        </label>
        <div className="toolbar">
          <input type="submit" value={deletePending ? 'Deleting...' : 'Delete Page'} disabled={!canDelete} />
        </div>
      </form>

      {statusText ? <p className="subtitle">{statusText}</p> : null}
      {!isConnected ? <p className="subtitle">Connect the owner wallet to continue.</p> : null}
      {isConnected && !isOwner ? <p className="subtitle">Switch to the owner wallet to continue.</p> : null}
    </div>
  )
}
