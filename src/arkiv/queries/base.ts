import { and, desc, eq } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getArkivPublicClient, type ArkivPublicClient } from '@/arkiv/clients'
import { ENTITY_TYPES, type EntityType } from '@/arkiv/types'

export type QueryContext = {
  client?: ArkivPublicClient
}

export function getQueryClient(context?: QueryContext): ArkivPublicClient {
  return context?.client ?? getArkivPublicClient()
}

export function typePredicate(entityType: EntityType) {
  return and([eq('type', entityType), eq('schemaVersion', '1')])
}

export async function fetchCurrentBlock(context?: QueryContext): Promise<bigint> {
  const client = getQueryClient(context)
  const timing = await client.getBlockTiming()
  return timing.currentBlock
}

export async function queryByEntityKey(key: Hex, context?: QueryContext) {
  const client = getQueryClient(context)
  return client.getEntity(key)
}

export async function queryOwnedEntityCount(owner: Hex, context?: QueryContext): Promise<number> {
  const client = getQueryClient(context)
  return client.buildQuery().ownedBy(owner).where(eq('schemaVersion', '1')).count()
}

export function updatedDesc() {
  return desc('updatedAtMs', 'number')
}

export const KB_TYPES = ENTITY_TYPES
