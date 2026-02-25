import type { CreateEntityParameters, UpdateEntityParameters } from '@arkiv-network/sdk'
import { KB_SCHEMA_VERSION, ENTITY_TYPES, type PagePayload, type PageStatus } from '@/arkiv/types'
import { buildAttributes, encodeJsonPayload } from '@/arkiv/schema/helpers'
import { pageExpirationSeconds } from '@/arkiv/schema/expiration'

export type BuildPageEntityInput = {
  spaceKey: `0x${string}`
  spaceSlug: string
  pageSlug: string
  title: string
  status: PageStatus
  parentPageKey?: `0x${string}`
  updatedAtMs: number
  payload: PagePayload
  searchTokens: string[]
}

export const PAGE_SEARCH_TOKEN_LIMIT = 20
export const PAGE_SEARCH_TOKEN_ATTRIBUTE_PREFIX = 'token_'

export function pageSearchTokenKey(index: number): string {
  return `${PAGE_SEARCH_TOKEN_ATTRIBUTE_PREFIX}${index}`
}

function buildSearchTokenAttributes(searchTokens: string[]) {
  const normalizedTokens = Array.from(
    new Set(
      searchTokens
        .map((token) => token.trim().toLowerCase())
        .filter((token) => token.length > 1)
    )
  ).slice(0, PAGE_SEARCH_TOKEN_LIMIT)

  return normalizedTokens.map((token, index) => ({
    key: pageSearchTokenKey(index),
    value: token
  }))
}

function pageAttributes(input: BuildPageEntityInput) {
  return buildAttributes({
    schemaVersion: KB_SCHEMA_VERSION,
    type: ENTITY_TYPES.page,
    spaceKey: input.spaceKey,
    spaceSlug: input.spaceSlug,
    pageSlug: input.pageSlug,
    title: input.title,
    status: input.status,
    parentPageKey: input.parentPageKey,
    updatedAtMs: input.updatedAtMs
  }).concat(buildSearchTokenAttributes(input.searchTokens))
}

export function buildPageCreateEntity(input: BuildPageEntityInput): CreateEntityParameters {
  return {
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: pageExpirationSeconds(input.status),
    attributes: pageAttributes(input)
  }
}

export function buildPageUpdateEntity(entityKey: `0x${string}`, input: BuildPageEntityInput): UpdateEntityParameters {
  return {
    entityKey,
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: pageExpirationSeconds(input.status),
    attributes: pageAttributes(input)
  }
}
