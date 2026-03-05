'use client'

import Link from 'next/link'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { canManageOwnedEntity } from '@/features/ownership/permissions'

type SpaceOwnerActionsProps = {
  spaceSlug: string
  owner: Hex | undefined
}

export function SpaceOwnerActions({ spaceSlug, owner }: SpaceOwnerActionsProps) {
  let address: string | undefined
  let isConnected = false

  try {
    const account = useAccount()
    address = account.address
    isConnected = account.isConnected
  } catch {
    address = undefined
    isConnected = false
  }

  const isOwner = isConnected && canManageOwnedEntity(owner, address)

  return (
    <div className="toolbar space-owner-actions">
      {isOwner ? (
        <Link href={`/spaces/${spaceSlug}/settings`} className="button secondary">
          <span className="material-symbols-outlined" aria-hidden>
            settings
          </span>
          Space Settings
        </Link>
      ) : (
        <button type="button" className="button secondary" disabled title="Connect the owner wallet to edit settings.">
          <span className="material-symbols-outlined" aria-hidden>
            settings
          </span>
          Space Settings
        </button>
      )}

      {isOwner ? (
        <Link href={`/spaces/${spaceSlug}/new`} className="button">
          <span className="material-symbols-outlined" aria-hidden>
            add_circle
          </span>
          New Page
        </Link>
      ) : (
        <button type="button" className="button" disabled title="Connect the owner wallet to create pages.">
          <span className="material-symbols-outlined" aria-hidden>
            add_circle
          </span>
          New Page
        </button>
      )}
    </div>
  )
}
