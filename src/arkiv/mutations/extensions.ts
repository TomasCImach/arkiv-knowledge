import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { buildExtendEntityParams } from '@/arkiv/mutations/plans'

export type ExtendKind = 'space' | 'page' | 'revision'

export async function extendOwnedEntity(
  client: ArkivWriteClient,
  entityKey: Hex,
  kind: ExtendKind
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.extendEntity(buildExtendEntityParams(entityKey, kind))

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}
