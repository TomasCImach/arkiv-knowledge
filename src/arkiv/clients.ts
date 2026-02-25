import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  type Attribute,
  type Entity,
  type MutateEntitiesParameters,
  type CreateEntityParameters,
  type CreateEntityReturnType,
  type UpdateEntityParameters,
  type UpdateEntityReturnType,
  type ExtendEntityParameters,
  type ExtendEntityReturnType,
  type DeleteEntityParameters,
  type DeleteEntityReturnType,
  type MutateEntitiesReturnType
} from '@arkiv-network/sdk'
import type { EIP1193Provider, Hex } from 'viem'
import { getArkivConfig } from '@/arkiv/config'

let publicClientSingleton: ReturnType<typeof createPublicClient> | undefined

function resolvedRpcUrl() {
  const config = getArkivConfig()
  if (typeof window !== 'undefined') {
    return config.rpcUrl ?? '/api/arkiv-rpc'
  }

  return config.rpcUrl ?? config.chain.rpcUrls.default.http[0]
}

export function getArkivPublicClient() {
  if (!publicClientSingleton) {
    const config = getArkivConfig()
    publicClientSingleton = createPublicClient({
      chain: config.chain,
      transport: http(resolvedRpcUrl(), {
        retryCount: 1,
        retryDelay: 250,
        timeout: 10000
      })
    })
  }

  return publicClientSingleton
}

export function createConnectedArkivWalletClient(account: Hex, provider: EIP1193Provider) {
  const config = getArkivConfig()
  const walletClient = createWalletClient({
    account,
    chain: config.chain,
    transport: custom(provider)
  })
  const receiptClient = createPublicClient({
    chain: config.chain,
    transport: http(resolvedRpcUrl(), {
      retryCount: 1,
      retryDelay: 250,
      timeout: 10000
    })
  })

  ;(walletClient as unknown as { waitForTransactionReceipt: typeof receiptClient.waitForTransactionReceipt })
    .waitForTransactionReceipt = receiptClient.waitForTransactionReceipt

  return walletClient
}

export type ArkivPublicClient = ReturnType<typeof getArkivPublicClient>
export type ArkivWalletClient = ReturnType<typeof createConnectedArkivWalletClient>
export type ArkivWriteClient = {
  account?: { address: Hex }
  createEntity: (data: CreateEntityParameters) => Promise<CreateEntityReturnType>
  updateEntity: (data: UpdateEntityParameters) => Promise<UpdateEntityReturnType>
  extendEntity: (data: ExtendEntityParameters) => Promise<ExtendEntityReturnType>
  deleteEntity: (data: DeleteEntityParameters) => Promise<DeleteEntityReturnType>
  mutateEntities: (data: MutateEntitiesParameters) => Promise<MutateEntitiesReturnType>
}

export type ArkivMutationSummary = {
  txHash: Hex
  createdEntities: Hex[]
  updatedEntities: Hex[]
  deletedEntities: Hex[]
  extendedEntities: Hex[]
}

export type MinimalEntity = Pick<Entity, 'key' | 'owner' | 'expiresAtBlock' | 'attributes' | 'toJson'>
export type MinimalAttribute = Attribute
export type MutationInput = MutateEntitiesParameters
