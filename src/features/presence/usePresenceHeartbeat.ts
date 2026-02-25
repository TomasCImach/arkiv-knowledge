'use client'

import { useEffect } from 'react'
import type { Hex } from 'viem'
import { heartbeatPresence } from '@/arkiv/mutations/presence'
import type { ArkivWriteClient } from '@/arkiv/clients'

type UsePresenceHeartbeatInput = {
  client?: ArkivWriteClient
  entityKey?: Hex
  intervalMs?: number
}

export function usePresenceHeartbeat({ client, entityKey, intervalMs = 30000 }: UsePresenceHeartbeatInput) {
  useEffect(() => {
    if (!client || !entityKey) {
      return
    }

    if (typeof window !== 'undefined') {
      console.info('[presence-heartbeat] started', {
        entityKey,
        intervalMs,
        pathname: window.location.pathname
      })
    }

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        console.info('[presence-heartbeat] extending presence', {
          entityKey,
          pathname: window.location.pathname
        })
      }
      void heartbeatPresence(client, entityKey).catch(() => {
        // Keep heartbeat failure non-fatal for UX; panel shows stale viewers until refresh.
      })
    }, intervalMs)

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        console.info('[presence-heartbeat] stopped', {
          entityKey,
          pathname: window.location.pathname
        })
      }
    }
  }, [client, entityKey, intervalMs])
}
