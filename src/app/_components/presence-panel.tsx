'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import type { ParsedPresence } from '@/arkiv/types'
import { joinPresence, leavePresence } from '@/arkiv/mutations/presence'
import { usePresenceHeartbeat } from '@/features/presence/usePresenceHeartbeat'
import { equalAddress } from '@/features/ownership/permissions'
import { TechnicalDetails } from '@/app/_components/technical-details'

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
  const { address } = useAccount()
  const [joinedEntityKey, setJoinedEntityKey] = useState<Hex | undefined>()
  const [joinedViewer, setJoinedViewer] = useState<Hex | undefined>()
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)
  const isMountedRef = useRef(true)
  const joinInFlightRef = useRef(false)
  const leaveInFlightRef = useRef(false)

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

  const existingSessionRecord = useMemo(() => {
    if (!address) {
      return undefined
    }

    return records.find((record) => equalAddress(record.viewer, address) && record.sessionId === sessionId)
  }, [address, records, sessionId])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!existingSessionRecord || !address) {
      return
    }

    if (joinedEntityKey === existingSessionRecord.entityKey && equalAddress(joinedViewer, address)) {
      return
    }

    setJoinedEntityKey(existingSessionRecord.entityKey)
    setJoinedViewer(address)
  }, [address, existingSessionRecord, joinedEntityKey, joinedViewer])

  usePresenceHeartbeat({ entityKey: joinedEntityKey })

  useEffect(() => {
    return () => {
      if (joinedEntityKey) {
        void leavePresence(joinedEntityKey).catch(() => {
          // Best effort cleanup.
        })
      }
    }
  }, [joinedEntityKey])

  useEffect(() => {
    if (!joinedEntityKey) {
      return
    }

    const isSameViewer = Boolean(address && joinedViewer && equalAddress(joinedViewer, address))
    if (isSameViewer || leaveInFlightRef.current) {
      return
    }

    leaveInFlightRef.current = true
    setPending(true)
    console.info('[presence] requesting server-side leave', {
      joinedEntityKey
    })

    void leavePresence(joinedEntityKey)
      .catch((error) => {
        console.error('leave-presence failed', error)
      })
      .finally(() => {
        leaveInFlightRef.current = false
        if (isMountedRef.current) {
          setJoinedEntityKey(undefined)
          setJoinedViewer(undefined)
          setPending(false)
          setStatusText('')
          router.refresh()
        }
      })
  }, [address, joinedEntityKey, joinedViewer, router])

  useEffect(() => {
    if (!address || joinedEntityKey || existingSessionRecord || joinInFlightRef.current || leaveInFlightRef.current) {
      return
    }

    joinInFlightRef.current = true
    setPending(true)
    setStatusText('')
    console.info('[presence] requesting server-side join', {
      spaceKey,
      pageKey,
      sessionId
    })

    void joinPresence({
      spaceKey,
      pageKey,
      viewer: address,
      sessionId,
      displayName: shortAddress(address)
    })
      .then((result) => {
        if (!isMountedRef.current) {
          return
        }
        setJoinedEntityKey(result.entityKey)
        setJoinedViewer(address)
        setStatusText(`Presence active (${result.txHash.slice(0, 10)}...)`)
        router.refresh()
      })
      .catch((error) => {
        console.error('join-presence failed', error)
        if (isMountedRef.current) {
          setStatusText(error instanceof Error ? error.message : 'Could not join presence.')
        }
      })
      .finally(() => {
        joinInFlightRef.current = false
        if (isMountedRef.current) {
          setPending(false)
        }
      })
  }, [address, existingSessionRecord, joinedEntityKey, pageKey, router, sessionId, spaceKey])

  return (
    <section className="card stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Live Presence</h3>
      </div>
      <TechnicalDetails summary="Technical details (presence retention)">
        <span className="badge">Presence TTL: 90s with server-signed heartbeat extension</span>
      </TechnicalDetails>

      <p className="subtitle">
        {address
          ? pending
            ? 'Syncing your live presence...'
            : 'Live presence is handled automatically while your wallet is connected.'
          : 'Connect your wallet to appear as an active viewer automatically.'}
      </p>
      {statusText ? <p className="subtitle">{statusText}</p> : null}

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
