import { and, asc, eq, or } from '@arkiv-network/sdk/query'
import type { Predicate } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getQueryClient, type QueryContext, updatedDesc } from '@/arkiv/queries/base'
import { PAGE_SEARCH_TOKEN_LIMIT, pageSearchTokenKey } from '@/arkiv/schema/page'
import { parsePageEntity, parseRevisionEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type PageSearchInput, type ParsedPage, type ParsedRevision } from '@/arkiv/types'
import { tokenizeForSearch } from '@/lib/text'

export async function listPagesBySpace(spaceSlug: string, context?: QueryContext): Promise<ParsedPage[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.page), eq('schemaVersion', '1'), eq('spaceSlug', spaceSlug)]))
    .orderBy(updatedDesc())
    .fetch()

  return result.entities.map(parsePageEntity).slice(0, 100)
}

export async function getPageBySlug(spaceSlug: string, pageSlug: string, context?: QueryContext): Promise<ParsedPage | null> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(
      and([
        eq('type', ENTITY_TYPES.page),
        eq('schemaVersion', '1'),
        eq('spaceSlug', spaceSlug),
        eq('pageSlug', pageSlug)
      ])
    )
    .fetch()

  if (result.entities.length === 0) {
    return null
  }

  return parsePageEntity(result.entities[0])
}

export async function listRevisionsByPage(pageKey: Hex, context?: QueryContext): Promise<ParsedRevision[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.revision), eq('schemaVersion', '1'), eq('pageKey', pageKey)]))
    .orderBy(asc('revisionNo', 'number'))
    .fetch()

  return result.entities.map(parseRevisionEntity).slice(0, 200)
}

export function buildPageSearchPredicates(input: PageSearchInput): Predicate[] {
  const predicates: Predicate[] = [
    eq('type', ENTITY_TYPES.page),
    eq('schemaVersion', '1'),
    eq('spaceSlug', input.spaceSlug)
  ]

  if (input.status) {
    predicates.push(eq('status', input.status))
  }

  const tokens = tokenizeForSearch(input.q ?? '')
  if (tokens.length > 0) {
    const tokenPredicates = tokens.flatMap((token) =>
      Array.from({ length: PAGE_SEARCH_TOKEN_LIMIT }, (_, index) => eq(pageSearchTokenKey(index), token))
    )
    predicates.push(or(tokenPredicates))
  }

  return predicates
}

export async function searchPages(input: PageSearchInput, context?: QueryContext): Promise<ParsedPage[]> {
  const client = getQueryClient(context)
  const builder = client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and(buildPageSearchPredicates(input)))
    .orderBy(updatedDesc())

  if (input.owner) {
    builder.ownedBy(input.owner)
  }

  const result = await builder.fetch()
  return result.entities.map(parsePageEntity).slice(0, 50)
}
