'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useArkivEvents } from '@/arkiv/events/useArkivEvents'

export function RealtimeRefresh({ spaceKey, pageKey }: { spaceKey: Hex; pageKey?: Hex }) {
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  useArkivEvents({
    onRelevantEvent: refresh,
    spaceKey,
    pageKey
  })

  return null
}
