import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { buildTransferOwnershipParams } from '@/arkiv/mutations/plans'

export async function transferEntityOwnership(
  client: ArkivWriteClient,
  entityKey: Hex,
  newOwner: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.changeOwnership(buildTransferOwnershipParams(entityKey, newOwner))

  return {
    entityKey: result.entityKey,
    txHash: result.txHash as Hex
  }
}
