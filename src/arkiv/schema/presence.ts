import type { CreateEntityParameters } from '@arkiv-network/sdk'
import { KB_SCHEMA_VERSION, ENTITY_TYPES, type PresencePayload } from '@/arkiv/types'
import { EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'
import { buildAttributes, encodeJsonPayload } from '@/arkiv/schema/helpers'

export type BuildPresenceEntityInput = {
  spaceKey: `0x${string}`
  pageKey: `0x${string}`
  viewer: `0x${string}`
  sessionId: string
  payload: PresencePayload
}

export function buildPresenceCreateEntity(input: BuildPresenceEntityInput): CreateEntityParameters {
  return {
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: EXPIRATION_SECONDS.presence,
    attributes: buildAttributes({
      schemaVersion: KB_SCHEMA_VERSION,
      type: ENTITY_TYPES.presence,
      spaceKey: input.spaceKey,
      pageKey: input.pageKey,
      viewer: input.viewer,
      sessionId: input.sessionId
    })
  }
}
