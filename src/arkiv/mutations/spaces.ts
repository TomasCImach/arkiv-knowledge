import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { buildCreateSpaceParams, buildTransferOwnershipParams, buildUpdateSpaceParams } from '@/arkiv/mutations/plans'
import type { SpaceStatus, SpaceVisibility } from '@/arkiv/types'

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
  const result = await client.createEntity(await buildCreateSpaceParams(input))

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
  const result = await client.updateEntity(buildUpdateSpaceParams(entityKey, input))

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}

export async function transferSpaceOwnership(
  client: ArkivWriteClient,
  spaceKey: Hex,
  newOwner: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.changeOwnership(buildTransferOwnershipParams(spaceKey, newOwner))

  return {
    entityKey: result.entityKey,
    txHash: result.txHash as Hex
  }
}
