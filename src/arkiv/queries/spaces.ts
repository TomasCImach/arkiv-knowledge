import { and, eq } from '@arkiv-network/sdk/query'
import { getQueryClient, type QueryContext, updatedDesc } from '@/arkiv/queries/base'
import { parseSpaceEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type ParsedSpace } from '@/arkiv/types'

export async function listSpaces(limit = 50, context?: QueryContext): Promise<ParsedSpace[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .orderBy(updatedDesc())
    .where(and([eq('type', ENTITY_TYPES.space), eq('schemaVersion', '1')]))
    .limit(limit)
    .fetch()

  return result.entities.map(parseSpaceEntity)
}

export async function getSpaceBySlug(spaceSlug: string, context?: QueryContext): Promise<ParsedSpace | null> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.space), eq('schemaVersion', '1'), eq('spaceSlug', spaceSlug)]))
    .limit(1)
    .fetch()

  if (result.entities.length === 0) {
    return null
  }

  return parseSpaceEntity(result.entities[0])
}
