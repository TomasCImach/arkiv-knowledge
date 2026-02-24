import { and, eq } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getQueryClient, type QueryContext, updatedDesc } from '@/arkiv/queries/base'
import { parseLinkEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type ParsedLink } from '@/arkiv/types'

export async function listOutgoingLinks(fromPageKey: Hex, context?: QueryContext): Promise<ParsedLink[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.link), eq('schemaVersion', '1'), eq('fromPageKey', fromPageKey)]))
    .orderBy(updatedDesc())
    .limit(200)
    .fetch()

  return result.entities.map(parseLinkEntity)
}

export async function listBacklinks(toPageKey: Hex, context?: QueryContext): Promise<ParsedLink[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.link), eq('schemaVersion', '1'), eq('toPageKey', toPageKey)]))
    .orderBy(updatedDesc())
    .limit(200)
    .fetch()

  return result.entities.map(parseLinkEntity)
}
