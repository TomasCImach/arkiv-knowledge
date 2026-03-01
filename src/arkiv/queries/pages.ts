import { and, asc, desc, eq, neq, not, or } from '@arkiv-network/sdk/query'
import type { Predicate } from '@arkiv-network/sdk/query'
import type { Hex } from 'viem'
import { getQueryClient, type QueryContext, updatedDesc } from '@/arkiv/queries/base'
import { PAGE_SEARCH_TOKEN_LIMIT, pageSearchTokenKey } from '@/arkiv/schema/page'
import { parsePageEntity, parseRevisionEntity } from '@/arkiv/schema/parser'
import { ENTITY_TYPES, type GlobalPageSearchInput, type PageSearchInput, type PageSortMode, type ParsedPage, type ParsedRevision } from '@/arkiv/types'
import { tokenizeForSearch } from '@/lib/text'

function compareCanonicalPages(a: ParsedPage, b: ParsedPage): number {
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

function selectCanonicalPage(pages: ParsedPage[]): ParsedPage | null {
  if (pages.length === 0) {
    return null
  }

  return pages.slice().sort(compareCanonicalPages)[0] ?? null
}

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

export async function listPagesBySpaceKey(spaceKey: Hex, context?: QueryContext): Promise<ParsedPage[]> {
  const client = getQueryClient(context)
  const result = await client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and([eq('type', ENTITY_TYPES.page), eq('schemaVersion', '1'), eq('spaceKey', spaceKey)]))
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
    .orderBy(updatedDesc())
    .fetch()

  return selectCanonicalPage(result.entities.map(parsePageEntity))
}

export async function getPageBySlugInSpace(spaceKey: Hex, pageSlug: string, context?: QueryContext): Promise<ParsedPage | null> {
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
        eq('spaceKey', spaceKey),
        eq('pageSlug', pageSlug)
      ])
    )
    .orderBy(updatedDesc())
    .fetch()

  return selectCanonicalPage(result.entities.map(parsePageEntity))
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

export function buildGlobalPageSearchPredicates(input: GlobalPageSearchInput): Predicate[] {
  const predicates: Predicate[] = [
    eq('type', ENTITY_TYPES.page),
    eq('schemaVersion', '1')
  ]

  if (input.spaceKey) {
    predicates.push(eq('spaceKey', input.spaceKey))
  }

  if (input.spaceSlug) {
    predicates.push(eq('spaceSlug', input.spaceSlug))
  }

  if (input.status) {
    predicates.push(eq('status', input.status))
  }

  if (input.parentMode === 'root') {
    predicates.push(not('parentPageKey'))
  } else if (input.parentMode === 'child') {
    predicates.push(neq('parentPageKey', ''))
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

export function buildPageSearchPredicates(input: PageSearchInput): Predicate[] {
  return buildGlobalPageSearchPredicates(input)
}

function applyPageSort<T extends { orderBy: (value: ReturnType<typeof desc>) => T }>(builder: T, sort: PageSortMode | undefined): T {
  const resolvedSort = sort ?? 'updated_desc'

  if (resolvedSort === 'updated_asc') {
    builder.orderBy(asc('updatedAtMs', 'number'))
    builder.orderBy(asc('title', 'string'))
    return builder
  }

  if (resolvedSort === 'title_asc') {
    builder.orderBy(asc('title', 'string'))
    builder.orderBy(desc('updatedAtMs', 'number'))
    return builder
  }

  builder.orderBy(updatedDesc())
  builder.orderBy(asc('title', 'string'))
  return builder
}

export async function searchPages(input: PageSearchInput, context?: QueryContext): Promise<ParsedPage[]> {
  const client = getQueryClient(context)
  const builder = client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and(buildPageSearchPredicates(input)))

  if (input.owner) {
    builder.ownedBy(input.owner)
  }

  applyPageSort(builder, input.sort)

  const result = await builder.fetch()
  return result.entities.map(parsePageEntity).slice(0, 100)
}

export async function searchPagesGlobal(input: GlobalPageSearchInput, context?: QueryContext): Promise<ParsedPage[]> {
  const client = getQueryClient(context)
  const builder = client
    .buildQuery()
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .where(and(buildGlobalPageSearchPredicates(input)))

  if (input.owner) {
    builder.ownedBy(input.owner)
  }

  applyPageSort(builder, input.sort)

  const result = await builder.fetch()
  return result.entities.map(parsePageEntity).slice(0, 120)
}
