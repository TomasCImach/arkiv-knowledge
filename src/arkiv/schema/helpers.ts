import { jsonToPayload, type Attribute } from '@arkiv-network/sdk'

export type BaseEntityInput = {
  attributes: Attribute[]
  payload: Uint8Array
  contentType: 'application/json'
  expiresIn: number
}

export function encodeJsonPayload<T extends object>(payload: T): Uint8Array {
  return jsonToPayload(payload)
}

export function buildAttributes(attributes: Record<string, string | number | undefined>): Attribute[] {
  return Object.entries(attributes)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.key.localeCompare(b.key))
}
