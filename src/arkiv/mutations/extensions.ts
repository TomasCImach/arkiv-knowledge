import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'

export type ExtendKind = 'space' | 'page' | 'revision'

const extensionSecondsByKind: Record<ExtendKind, number> = {
  space: EXPIRATION_SECONDS.space,
  page: EXPIRATION_SECONDS.pagePublished,
  revision: EXPIRATION_SECONDS.revision
}

export async function extendOwnedEntity(
  client: ArkivWriteClient,
  entityKey: Hex,
  kind: ExtendKind
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.extendEntity({
    entityKey,
    expiresIn: extensionSecondsByKind[kind]
  })

  return {
    entityKey: result.entityKey,
    txHash: result.txHash
  }
}
