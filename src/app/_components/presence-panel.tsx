'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import type { ParsedPresence } from '@/arkiv/types'
import { joinPresence, leavePresence } from '@/arkiv/mutations/presence'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { usePresenceHeartbeat } from '@/features/presence/usePresenceHeartbeat'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

type PresencePanelProps = {
  spaceKey: Hex
  pageKey: Hex
  records: ParsedPresence[]
}

function shortAddress(address: Hex): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function PresencePanel({ spaceKey, pageKey, records }: PresencePanelProps) {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId } = useAccount()
  const [joinedEntityKey, setJoinedEntityKey] = useState<Hex | undefined>()
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'session-ssr'
    }

    const existing = window.sessionStorage.getItem('arkiv-presence-session')
    if (existing) {
      return existing
    }

    const generated = crypto.randomUUID()
    window.sessionStorage.setItem('arkiv-presence-session', generated)
    return generated
  }, [])

  usePresenceHeartbeat({
    client: walletClient,
    entityKey: joinedEntityKey
  })

  useEffect(() => {
    return () => {
      if (walletClient && joinedEntityKey) {
        void leavePresence(walletClient, joinedEntityKey).catch(() => {
          // Best effort cleanup.
        })
      }
    }
  }, [joinedEntityKey, walletClient])

  async function onJoin() {
    if (!walletClient || !address) {
      setStatusText('Connect wallet to join presence.')
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
      const result = await joinPresence(walletClient, {
        spaceKey,
        pageKey,
        viewer: address,
        sessionId,
        displayName: shortAddress(address)
      })
      setJoinedEntityKey(result.entityKey)
      setStatusText(`Joined (${result.txHash.slice(0, 10)}...)`)
      router.refresh()
    } catch (error) {
      console.error('join-presence failed', error)
      setStatusText(formatWalletError(error, 'Could not join presence.'))
    } finally {
      setPending(false)
    }
  }

  async function onLeave() {
    if (!walletClient || !joinedEntityKey) {
      return
    }

    setPending(true)
    setStatusText('')

    try {
      const result = await leavePresence(walletClient, joinedEntityKey)
      setStatusText(`Left (${result.txHash.slice(0, 10)}...)`)
      setJoinedEntityKey(undefined)
      router.refresh()
    } catch (error) {
      console.error('leave-presence failed', error)
      setStatusText(formatWalletError(error, 'Could not leave presence.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="card stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Live Presence</h3>
        <span className="badge">TTL 90s with heartbeat</span>
      </div>

      <div className="toolbar">
        <button type="button" onClick={onJoin} disabled={pending || Boolean(joinedEntityKey)}>
          {pending ? 'Joining...' : joinedEntityKey ? 'Joined' : 'Join Presence'}
        </button>
        <button type="button" className="secondary" onClick={onLeave} disabled={pending || !joinedEntityKey}>
          Leave
        </button>
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>

      <div className="stack" style={{ gap: '0.5rem' }}>
        {records.length === 0 ? <p className="subtitle">No active viewers right now.</p> : null}
        {records.map((record) => (
          <div key={record.entityKey} className="toolbar" style={{ justifyContent: 'space-between' }}>
            <strong>{record.payload.displayName}</strong>
            <span className="subtitle">{record.viewer.slice(0, 10)}...</span>
          </div>
        ))}
      </div>
    </section>
  )
}
