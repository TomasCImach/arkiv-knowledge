'use client'

import { useEffect } from 'react'
import type { Hex } from 'viem'
import { getArkivPublicClient } from '@/arkiv/clients'
import { attributeValue } from '@/arkiv/attributes'

type UseArkivEventsOptions = {
  onRelevantEvent: () => void
  spaceKey?: Hex
  pageKey?: Hex
  pollingIntervalMs?: number
  fallbackPollMs?: number
}

export function useArkivEvents({
  onRelevantEvent,
  pageKey,
  spaceKey,
  pollingIntervalMs = 2500,
  fallbackPollMs = 12000
}: UseArkivEventsOptions) {
  useEffect(() => {
    let mounted = true
    let interval: ReturnType<typeof setInterval> | undefined
    let unsubscribe: (() => void) | undefined

    const client = getArkivPublicClient()

    const onEvent = async (entityKey: Hex) => {
      try {
        const entity = await client.getEntity(entityKey)
        const entitySpaceKey = attributeValue(entity.attributes, 'spaceKey')
        const entityPageKey = attributeValue(entity.attributes, 'pageKey')

        const spaceMatches = !spaceKey || entitySpaceKey === spaceKey
        const pageMatches = !pageKey || entityPageKey === pageKey || entity.key === pageKey

        if (spaceMatches && pageMatches && mounted) {
          onRelevantEvent()
        }
      } catch {
        if (mounted) {
          onRelevantEvent()
        }
      }
    }

    const start = async () => {
      try {
        unsubscribe = await client.subscribeEntityEvents(
          {
            onEntityCreated: (event) => void onEvent(event.entityKey),
            onEntityUpdated: (event) => void onEvent(event.entityKey),
            onEntityDeleted: () => onRelevantEvent(),
            onEntityExpired: () => onRelevantEvent(),
            onEntityExpiresInExtended: (event) => void onEvent(event.entityKey),
            onError: () => {
              if (!interval) {
                interval = setInterval(onRelevantEvent, fallbackPollMs)
              }
            }
          },
          pollingIntervalMs
        )
      } catch {
        interval = setInterval(onRelevantEvent, fallbackPollMs)
      }
    }

    void start()

    return () => {
      mounted = false
      if (interval) {
        clearInterval(interval)
      }
      unsubscribe?.()
    }
  }, [fallbackPollMs, onRelevantEvent, pageKey, pollingIntervalMs, spaceKey])
}
