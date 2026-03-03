'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAddress, type Hex } from 'viem'
import { useAccount } from 'wagmi'
import { transferEntityOwnership } from '@/arkiv/mutations/ownership'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { canManageOwnedEntity, equalAddress } from '@/features/ownership/permissions'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

type TransferOwnershipFormProps = {
  entityKey: Hex
  entityOwner: Hex | undefined
  entityLabel: 'space' | 'page'
}

export function TransferOwnershipForm({ entityKey, entityOwner, entityLabel }: TransferOwnershipFormProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()

  const [newOwner, setNewOwner] = useState('')
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  const isOwner = useMemo(() => canManageOwnedEntity(entityOwner, address), [address, entityOwner])
  const canSubmit = Boolean(walletClient && isConnected && address && isOwner && !pending)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !isConnected || !address) {
      setStatusText(`Connect wallet to transfer ${entityLabel} ownership.`)
      return
    }

    if (!isOwner) {
      setStatusText(`Only owner can transfer ${entityLabel} ownership.`)
      return
    }

    const normalizedOwner = newOwner.trim()
    if (!isAddress(normalizedOwner)) {
      setStatusText('Provide a valid 0x owner address.')
      return
    }

    if (equalAddress(normalizedOwner, entityOwner)) {
      setStatusText('New owner must differ from current owner.')
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
      const result = await transferEntityOwnership(walletClient, entityKey, normalizedOwner as Hex)
      setStatusText(`Ownership transferred (${result.txHash.slice(0, 10)}...)`)
      setNewOwner('')
      router.refresh()
    } catch (error) {
      console.error('transfer-ownership failed', error)
      setStatusText(formatWalletError(error, `Failed to transfer ${entityLabel} ownership.`))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label>
        New owner wallet
        <input
          value={newOwner}
          onChange={(event) => setNewOwner(event.target.value)}
          placeholder="0x..."
          readOnly={!canSubmit}
        />
      </label>
      <div className="toolbar">
        <input type="submit" disabled={!canSubmit} value={pending ? 'Transferring...' : `Transfer ${entityLabel} ownership`} />
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>
      {!isConnected ? <p className="subtitle">Connect the owner wallet to continue.</p> : null}
      {isConnected && !isOwner ? <p className="subtitle">Switch to the owner wallet to continue.</p> : null}
    </form>
  )
}
