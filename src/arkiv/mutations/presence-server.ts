import 'server-only'

import type { Hex } from 'viem'
import { getArkivPresenceServerClient } from '@/arkiv/server-presence-client'
import { EXPIRATION_SECONDS } from '@/arkiv/schema'
import { buildPresenceCreateEntity } from '@/arkiv/schema/presence'
import { nowIso } from '@/lib/time'

export type ServerJoinPresenceInput = {
  spaceKey: Hex
  pageKey: Hex
  viewer: Hex
  sessionId: string
  displayName: string
}

export async function joinPresenceWithServerSigner(
  input: ServerJoinPresenceInput
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const client = getArkivPresenceServerClient()
  const result = await client.createEntity(
    buildPresenceCreateEntity({
      spaceKey: input.spaceKey,
      pageKey: input.pageKey,
      viewer: input.viewer,
      sessionId: input.sessionId,
      payload: {
        displayName: input.displayName,
        joinedAt: nowIso()
      }
    })
  )

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}

export async function heartbeatPresenceWithServerSigner(entityKey: Hex): Promise<{ entityKey: Hex; txHash: Hex }> {
  const client = getArkivPresenceServerClient()
  const result = await client.extendEntity({
    entityKey,
    expiresIn: EXPIRATION_SECONDS.presence
  })

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}

export async function leavePresenceWithServerSigner(entityKey: Hex): Promise<{ entityKey: Hex; txHash: Hex }> {
  const client = getArkivPresenceServerClient()
  const result = await client.deleteEntity({
    entityKey
  })

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}
