'use client'

import Link from 'next/link'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { equalAddress } from '@/features/ownership/permissions'

type OwnerEditPageCtaProps = {
  href: string
  owner: Hex | undefined
  isVerifiedOwnerSession: boolean
}

export function OwnerEditPageCta({ href, owner, isVerifiedOwnerSession }: OwnerEditPageCtaProps) {
  const { address, isConnected } = useAccount()
  const isConnectedOwner = isConnected && equalAddress(owner, address)
  const canEdit = isConnectedOwner && isVerifiedOwnerSession

  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      {canEdit ? (
        <Link href={href} className="button">
          Edit Page
        </Link>
      ) : (
        <button type="button" className="button" disabled>
          Edit Page
        </button>
      )}
      {!isConnected ? <p className="subtitle">Connect the owner wallet to edit this page.</p> : null}
      {isConnected && !isConnectedOwner ? <p className="subtitle">Switch to the owner wallet to edit this page.</p> : null}
      {isConnectedOwner && !isVerifiedOwnerSession ? (
        <p className="subtitle">Verify Private Access to enable owner edit actions.</p>
      ) : null}
    </div>
  )
}
