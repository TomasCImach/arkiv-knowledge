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

    const interval = setInterval(() => {
      void heartbeatPresence(client, entityKey).catch(() => {
        // Keep heartbeat failure non-fatal for UX; panel shows stale viewers until refresh.
      })
    }, intervalMs)

    return () => {
      clearInterval(interval)
    }
  }, [client, entityKey, intervalMs])
}
