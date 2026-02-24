import { z } from 'zod'
import type { Entity } from '@arkiv-network/sdk'
import type { Hex } from 'viem'
import { ENTITY_TYPES, type ParsedLink, type ParsedPage, type ParsedPresence, type ParsedRevision, type ParsedSpace } from '@/arkiv/types'

const spacePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
})

const pagePayloadSchema = z.object({
  title: z.string().min(1),
  bodyMarkdown: z.string(),
  summary: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
})

const revisionPayloadSchema = z.object({
  title: z.string().min(1),
  bodyMarkdown: z.string(),
  editSummary: z.string()
})

const linkPayloadSchema = z.object({
  sourceSlug: z.string().min(1),
  targetSlug: z.string().min(1)
})

const presencePayloadSchema = z.object({
  displayName: z.string().min(1),
  joinedAt: z.string().min(1)
})

function attrMap(entity: Entity): Map<string, string | number> {
  return new Map(entity.attributes.map((attribute) => [attribute.key, attribute.value]))
}

function requiredString(map: Map<string, string | number>, key: string): string {
  const value = map.get(key)
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing or invalid required string attribute: ${key}`)
  }
  return value
}

function requiredNumber(map: Map<string, string | number>, key: string): number {
  const value = map.get(key)
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Missing or invalid required number attribute: ${key}`)
  }
  return value
}

function optionalHex(map: Map<string, string | number>, key: string): Hex | undefined {
  const value = map.get(key)
  if (typeof value !== 'string' || value.length === 0) {
    return undefined
  }
  return value as Hex
}

function parseType(map: Map<string, string | number>, expectedType: string): void {
  const type = requiredString(map, 'type')
  if (type !== expectedType) {
    throw new Error(`Unexpected entity type. Expected ${expectedType}, got ${type}`)
  }
}

export function parseSpaceEntity(entity: Entity): ParsedSpace {
  const map = attrMap(entity)
  parseType(map, ENTITY_TYPES.space)

  return {
    entityKey: entity.key,
    owner: entity.owner,
    expiresAtBlock: entity.expiresAtBlock,
    spaceSlug: requiredString(map, 'spaceSlug'),
    visibility: requiredString(map, 'visibility') as ParsedSpace['visibility'],
    status: requiredString(map, 'status') as ParsedSpace['status'],
    updatedAtMs: requiredNumber(map, 'updatedAtMs'),
    payload: spacePayloadSchema.parse(entity.toJson())
  }
}

export function parsePageEntity(entity: Entity): ParsedPage {
  const map = attrMap(entity)
  parseType(map, ENTITY_TYPES.page)

  return {
    entityKey: entity.key,
    owner: entity.owner,
    expiresAtBlock: entity.expiresAtBlock,
    spaceKey: requiredString(map, 'spaceKey') as Hex,
    spaceSlug: requiredString(map, 'spaceSlug'),
    pageSlug: requiredString(map, 'pageSlug'),
    title: requiredString(map, 'title'),
    status: requiredString(map, 'status') as ParsedPage['status'],
    updatedAtMs: requiredNumber(map, 'updatedAtMs'),
    parentPageKey: optionalHex(map, 'parentPageKey'),
    payload: pagePayloadSchema.parse(entity.toJson())
  }
}

export function parseRevisionEntity(entity: Entity): ParsedRevision {
  const map = attrMap(entity)
  parseType(map, ENTITY_TYPES.revision)

  return {
    entityKey: entity.key,
    owner: entity.owner,
    expiresAtBlock: entity.expiresAtBlock,
    spaceKey: requiredString(map, 'spaceKey') as Hex,
    pageKey: requiredString(map, 'pageKey') as Hex,
    revisionNo: requiredNumber(map, 'revisionNo'),
    editedAtMs: requiredNumber(map, 'editedAtMs'),
    editor: requiredString(map, 'editor') as Hex,
    payload: revisionPayloadSchema.parse(entity.toJson())
  }
}

export function parseLinkEntity(entity: Entity): ParsedLink {
  const map = attrMap(entity)
  parseType(map, ENTITY_TYPES.link)

  return {
    entityKey: entity.key,
    owner: entity.owner,
    expiresAtBlock: entity.expiresAtBlock,
    spaceKey: requiredString(map, 'spaceKey') as Hex,
    fromPageKey: requiredString(map, 'fromPageKey') as Hex,
    toPageKey: requiredString(map, 'toPageKey') as Hex,
    updatedAtMs: requiredNumber(map, 'updatedAtMs'),
    payload: linkPayloadSchema.parse(entity.toJson())
  }
}

export function parsePresenceEntity(entity: Entity): ParsedPresence {
  const map = attrMap(entity)
  parseType(map, ENTITY_TYPES.presence)

  return {
    entityKey: entity.key,
    owner: entity.owner,
    expiresAtBlock: entity.expiresAtBlock,
    spaceKey: requiredString(map, 'spaceKey') as Hex,
    pageKey: requiredString(map, 'pageKey') as Hex,
    viewer: requiredString(map, 'viewer') as Hex,
    sessionId: requiredString(map, 'sessionId'),
    payload: presencePayloadSchema.parse(entity.toJson())
  }
}
