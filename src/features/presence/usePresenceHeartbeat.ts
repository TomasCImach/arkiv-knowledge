'use client'

import { useEffect } from 'react'
import type { Hex } from 'viem'
import { heartbeatPresence } from '@/arkiv/mutations/presence'

type UsePresenceHeartbeatInput = {
  entityKey?: Hex
  intervalMs?: number
}

export function usePresenceHeartbeat({ entityKey, intervalMs = 30000 }: UsePresenceHeartbeatInput) {
  useEffect(() => {
    if (!entityKey) {
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
      void heartbeatPresence(entityKey).catch(() => {
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
  }, [entityKey, intervalMs])
}
