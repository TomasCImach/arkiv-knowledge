import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { buildSpaceCreateEntity, buildSpaceUpdateEntity } from '@/arkiv/schema'
import type { SpaceStatus, SpaceVisibility } from '@/arkiv/types'
import { nowIso, nowMs } from '@/lib/time'

export type CreateSpaceInput = {
  spaceSlug: string
  name: string
  description: string
  visibility: SpaceVisibility
  status?: SpaceStatus
}

export type UpdateSpaceInput = {
  spaceSlug: string
  name: string
  description: string
  visibility: SpaceVisibility
  status?: SpaceStatus
  createdAt: string
}

export async function createSpace(client: ArkivWriteClient, input: CreateSpaceInput): Promise<{ entityKey: Hex; txHash: Hex }> {
  const timestamp = nowIso()
  const updatedAtMs = nowMs()

  const result = await client.createEntity(
    buildSpaceCreateEntity({
      spaceSlug: input.spaceSlug,
      visibility: input.visibility,
      status: input.status ?? 'active',
      updatedAtMs,
      payload: {
        name: input.name,
        description: input.description,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    })
  )

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}

export async function updateSpace(
  client: ArkivWriteClient,
  entityKey: Hex,
  input: UpdateSpaceInput
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const timestamp = nowIso()
  const updatedAtMs = nowMs()

  const result = await client.updateEntity(
    buildSpaceUpdateEntity(entityKey, {
      spaceSlug: input.spaceSlug,
      visibility: input.visibility,
      status: input.status ?? 'active',
      updatedAtMs,
      payload: {
        name: input.name,
        description: input.description,
        createdAt: input.createdAt,
        updatedAt: timestamp
      }
    })
  )

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}
