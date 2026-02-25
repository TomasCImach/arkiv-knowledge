import {
  createPublicClient,
  createWalletClient,
  EntityMutationError,
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
    return '/api/arkiv-rpc'
  }

  return config.rpcUrl ?? config.chain.rpcUrls.default.http[0]
}

type ErrorLike = {
  message?: unknown
  shortMessage?: unknown
  details?: unknown
  reason?: unknown
  metaMessages?: unknown
  cause?: unknown
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return ''
}

function collectErrorDetails(error: unknown, depth = 0): string[] {
  if (!error || depth > 4) {
    return []
  }

  const typed = error as ErrorLike
  const details: string[] = []

  for (const value of [typed.message, typed.shortMessage, typed.details, typed.reason]) {
    const text = toText(value)
    if (text) {
      details.push(text)
    }
  }

  if (Array.isArray(typed.metaMessages)) {
    for (const entry of typed.metaMessages) {
      const text = toText(entry)
      if (text) {
        details.push(text)
      }
    }
  }

  if (typed.cause) {
    details.push(...collectErrorDetails(typed.cause, depth + 1))
  }

  return details
}

function buildProviderFailureMessage(error: unknown): string {
  const details = Array.from(
    new Set(
      collectErrorDetails(error)
        .map((detail) => detail.replace(/\s+/g, ' ').trim())
        .filter((detail) => detail.length > 0)
    )
  )
  const primary = details[0]

  if (!primary) {
    return 'Wallet provider failed to send transaction.'
  }

  return `Wallet provider rejected transaction: ${primary}`
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
  const originalSendTransaction = walletClient.sendTransaction.bind(walletClient)
  ;(walletClient as unknown as { sendTransaction: typeof walletClient.sendTransaction }).sendTransaction = async (
    parameters
  ) => {
    try {
      return await originalSendTransaction(parameters)
    } catch (error) {
      throw new EntityMutationError(buildProviderFailureMessage(error))
    }
  }

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
