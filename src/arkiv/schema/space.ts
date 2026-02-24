import type { CreateEntityParameters, UpdateEntityParameters } from '@arkiv-network/sdk'
import { KB_SCHEMA_VERSION, ENTITY_TYPES, type SpacePayload, type SpaceStatus, type SpaceVisibility } from '@/arkiv/types'
import { EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'
import { buildAttributes, encodeJsonPayload } from '@/arkiv/schema/helpers'

export type BuildSpaceEntityInput = {
  spaceSlug: string
  visibility: SpaceVisibility
  status: SpaceStatus
  payload: SpacePayload
  updatedAtMs: number
}

export function buildSpaceCreateEntity(input: BuildSpaceEntityInput): CreateEntityParameters {
  return {
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: EXPIRATION_SECONDS.space,
    attributes: buildAttributes({
      schemaVersion: KB_SCHEMA_VERSION,
      type: ENTITY_TYPES.space,
      spaceSlug: input.spaceSlug,
      status: input.status,
      visibility: input.visibility,
      updatedAtMs: input.updatedAtMs
    })
  }
}

export function buildSpaceUpdateEntity(entityKey: `0x${string}`, input: BuildSpaceEntityInput): UpdateEntityParameters {
  return {
    entityKey,
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: EXPIRATION_SECONDS.space,
    attributes: buildAttributes({
      schemaVersion: KB_SCHEMA_VERSION,
      type: ENTITY_TYPES.space,
      spaceSlug: input.spaceSlug,
      status: input.status,
      visibility: input.visibility,
      updatedAtMs: input.updatedAtMs
    })
  }
}
