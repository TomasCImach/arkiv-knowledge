import { and, eq } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getQueryClient, type QueryContext, updatedDesc } from '@/arkiv/queries/base'
import { parseSpaceEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type ParsedSpace } from '@/arkiv/types'

function compareCanonicalSpaces(a: ParsedSpace, b: ParsedSpace): number {
  if (a.updatedAtMs !== b.updatedAtMs) {
    return b.updatedAtMs - a.updatedAtMs
  }

  const updatedAtA = Date.parse(a.payload.updatedAt)
  const updatedAtB = Date.parse(b.payload.updatedAt)
  const hasUpdatedAtA = Number.isFinite(updatedAtA)
  const hasUpdatedAtB = Number.isFinite(updatedAtB)
  if (hasUpdatedAtA && hasUpdatedAtB && updatedAtA !== updatedAtB) {
    return updatedAtB - updatedAtA
  }

  return a.entityKey.localeCompare(b.entityKey)
}

export async function listSpaces(limit = 50, context?: QueryContext): Promise<ParsedSpace[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .orderBy(updatedDesc())
    .where(and([eq('type', ENTITY_TYPES.space), eq('schemaVersion', '1')]))
    .fetch()

  return result.entities.map(parseSpaceEntity).slice(0, limit)
}

export async function listSpacesOwnedBy(owner: Hex, limit = 50, context?: QueryContext): Promise<ParsedSpace[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .ownedBy(owner)
    .orderBy(updatedDesc())
    .where(and([eq('type', ENTITY_TYPES.space), eq('schemaVersion', '1')]))
    .fetch()

  return result.entities.map(parseSpaceEntity).slice(0, limit)
}

export async function getSpaceBySlug(spaceSlug: string, context?: QueryContext): Promise<ParsedSpace | null> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.space), eq('schemaVersion', '1'), eq('spaceSlug', spaceSlug)]))
    .orderBy(updatedDesc())
    .fetch()

  const spaces = result.entities.map(parseSpaceEntity)
  if (spaces.length === 0) {
    return null
  }

  return spaces.slice().sort(compareCanonicalSpaces)[0] ?? null
}
