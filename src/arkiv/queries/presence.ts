import { and, eq } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getQueryClient, type QueryContext } from '@/arkiv/queries/base'
import { parsePresenceEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type ParsedPresence } from '@/arkiv/types'

export async function listPresenceForPage(pageKey: Hex, context?: QueryContext): Promise<ParsedPresence[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.presence), eq('schemaVersion', '1'), eq('pageKey', pageKey)]))
    .limit(200)
    .fetch()

  return result.entities.map(parsePresenceEntity)
}
