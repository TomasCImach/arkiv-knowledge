'use client'

import { useMemo, useState } from 'react'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { extendOwnedEntity, type ExtendKind } from '@/arkiv/mutations/extensions'
import { isNearExpiry } from '@/arkiv/schema/expiration'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { canExtendOwnedEntity } from '@/features/extensions/can-extend'

type ExtendEntityButtonProps = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  currentBlock: bigint
  kind: ExtendKind
}

export function ExtendEntityButton({ entityKey, owner, expiresAtBlock, currentBlock, kind }: ExtendEntityButtonProps) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const walletClient = useArkivWalletClient()
  const { address } = useAccount()

  const canExtend = useMemo(() => {
    return isNearExpiry(expiresAtBlock, currentBlock) && canExtendOwnedEntity(owner, address)
  }, [address, currentBlock, expiresAtBlock, owner])

  async function onExtend() {
    if (!walletClient || !canExtend) {
      return
    }

    setPending(true)
    setMessage('')

    try {
      const result = await extendOwnedEntity(walletClient, entityKey, kind)
      setMessage(`Extended (${result.txHash.slice(0, 10)}...)`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to extend entity')
    } finally {
      setPending(false)
    }
  }

  if (!isNearExpiry(expiresAtBlock, currentBlock)) {
    return <span className="badge">Healthy TTL</span>
  }

  return (
    <div className="toolbar">
      <button type="button" className="secondary" disabled={!canExtend || pending} onClick={onExtend}>
        {pending ? 'Extending...' : `Extend ${kind}`}
      </button>
      {message ? <span className="subtitle">{message}</span> : null}
      {!canExtend ? <span className="subtitle">Only owner can extend.</span> : null}
    </div>
  )
}
