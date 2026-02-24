import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { EXPIRATION_SECONDS } from '@/arkiv/schema'
import { buildPresenceCreateEntity } from '@/arkiv/schema/presence'
import { nowIso } from '@/lib/time'

export type JoinPresenceInput = {
  spaceKey: Hex
  pageKey: Hex
  viewer: Hex
  sessionId: string
  displayName: string
}

export async function joinPresence(
  client: ArkivWriteClient,
  input: JoinPresenceInput
): Promise<{ entityKey: Hex; txHash: Hex }> {
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

export async function heartbeatPresence(
  client: ArkivWriteClient,
  entityKey: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.extendEntity({
    entityKey,
    expiresIn: EXPIRATION_SECONDS.presence
  })

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}

export async function leavePresence(
  client: ArkivWriteClient,
  entityKey: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.deleteEntity({
    entityKey
  })

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}
