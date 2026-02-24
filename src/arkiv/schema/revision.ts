import type { CreateEntityParameters } from '@arkiv-network/sdk'
import { KB_SCHEMA_VERSION, ENTITY_TYPES, type RevisionPayload } from '@/arkiv/types'
import { EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'
import { buildAttributes, encodeJsonPayload } from '@/arkiv/schema/helpers'

export type BuildRevisionEntityInput = {
  spaceKey: `0x${string}`
  pageKey: `0x${string}`
  revisionNo: number
  editedAtMs: number
  editor: `0x${string}`
  payload: RevisionPayload
}

export function buildRevisionCreateEntity(input: BuildRevisionEntityInput): CreateEntityParameters {
  return {
    payload: encodeJsonPayload(input.payload),
    contentType: 'application/json',
    expiresIn: EXPIRATION_SECONDS.revision,
    attributes: buildAttributes({
      schemaVersion: KB_SCHEMA_VERSION,
      type: ENTITY_TYPES.revision,
      spaceKey: input.spaceKey,
      pageKey: input.pageKey,
      revisionNo: input.revisionNo,
      editedAtMs: input.editedAtMs,
      editor: input.editor
    })
  }
}
