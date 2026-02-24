import type { CreateEntityParameters } from '@arkiv-network/sdk'
import { KB_SCHEMA_VERSION, ENTITY_TYPES, type LinkPayload } from '@/arkiv/types'
import { EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'
import { buildAttributes, encodeJsonPayload } from '@/arkiv/schema/helpers'

export type BuildLinkEntityInput = {
  spaceKey: `0x${string}`
  fromPageKey: `0x${string}`
  toPageKey: `0x${string}`
  updatedAtMs: number
  payload: LinkPayload
}

export function buildLinkCreateEntity(input: BuildLinkEntityInput): CreateEntityParameters {
  return {
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: EXPIRATION_SECONDS.link,
    attributes: buildAttributes({
      schemaVersion: KB_SCHEMA_VERSION,
      type: ENTITY_TYPES.link,
      spaceKey: input.spaceKey,
      fromPageKey: input.fromPageKey,
      toPageKey: input.toPageKey,
      updatedAtMs: input.updatedAtMs
    })
  }
}
