'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import type { ParsedSpace } from '@/arkiv/types'
import { updateSpace } from '@/arkiv/mutations/spaces'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

type EditSpaceFormProps = {
  space: ParsedSpace
  viewer?: string
}

export function EditSpaceForm({ space, viewer }: EditSpaceFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [name, setName] = useState(space.payload.name)
  const [description, setDescription] = useState(space.payload.description)
  const [visibility, setVisibility] = useState(space.visibility)
  const [status, setStatus] = useState(space.status)
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  const isOwner = useMemo(() => canManageOwnedEntity(space.owner, address), [address, space.owner])
  const canSubmit = Boolean(walletClient && isConnected && address && isOwner && !pending)
  const readOnlyMode = !canSubmit

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !isConnected || !address) {
      setStatusText('Connect wallet to update space settings.')
      return
    }

    if (!isOwner) {
      setStatusText('Only owner can update space settings.')
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
      const result = await updateSpace(walletClient, space.entityKey, {
        spaceSlug: space.spaceSlug,
        name,
        description,
        visibility,
        status,
        createdAt: space.payload.createdAt
      })

      setStatusText(`Updated (${result.txHash.slice(0, 10)}...)`)
      const nextUrl = viewer ? `/spaces/${space.spaceSlug}?viewer=${viewer}` : `/spaces/${space.spaceSlug}`
      router.push(nextUrl)
      router.refresh()
    } catch (error) {
      console.error('edit-space failed', error)
      setStatusText(formatWalletError(error, 'Failed to update space settings.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Space Settings</h1>
      <p className="subtitle">Slug is immutable. Only the owner wallet can update settings.</p>

      <label>
        Space slug
        <input value={space.spaceSlug} readOnly disabled />
      </label>

      <label>
        Space name
        <input required value={name} onChange={(event) => setName(event.target.value)} readOnly={readOnlyMode} />
      </label>

      <label>
        Description
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          readOnly={readOnlyMode}
        />
      </label>

      <label>
        Visibility
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as typeof visibility)}
          disabled={readOnlyMode}
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </label>

      <label>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} disabled={readOnlyMode}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <div className="toolbar">
        <input type="submit" disabled={!canSubmit} value={pending ? 'Saving...' : 'Save Settings'} />
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>

      {!isConnected ? <p className="subtitle">Connect wallet to update space settings.</p> : null}
      {isConnected && !isOwner ? <p className="subtitle">Only owner can update space settings.</p> : null}
    </form>
  )
}
