import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'

export type MutationResult = {
  txHash: Hex
  createdEntities: Hex[]
  updatedEntities: Hex[]
  deletedEntities: Hex[]
  extendedEntities: Hex[]
}

export function normalizeMutationResult(result: {
  txHash: Hex
  createdEntities?: Hex[]
  updatedEntities?: Hex[]
  deletedEntities?: Hex[]
  extendedEntities?: Hex[]
}): MutationResult {
  return {
    txHash: result.txHash,
    createdEntities: result.createdEntities ?? [],
    updatedEntities: result.updatedEntities ?? [],
    deletedEntities: result.deletedEntities ?? [],
    extendedEntities: result.extendedEntities ?? []
  }
}

export function requireWalletClient(client: ArkivWriteClient | undefined): ArkivWriteClient {
  if (!client) {
    throw new Error('Wallet is required for write operations')
  }

  return client
}
