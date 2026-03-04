import type { Hex } from 'viem'
import { isHex } from 'viem'

export type JoinPresenceInput = {
  spaceKey: Hex
  pageKey: Hex
  viewer: Hex
  sessionId: string
  displayName: string
}

type PresenceMutationResponse = {
  entityKey?: string
  txHash?: string
  error?: string
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as PresenceMutationResponse
    if (payload.error && typeof payload.error === 'string') {
      return payload.error
    }
  } catch {
    // Ignore parse errors and return fallback.
  }

  return fallback
}

async function callPresenceApi(
  method: 'POST' | 'PATCH' | 'DELETE',
  body: Record<string, string>,
  fallback: string
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const response = await fetch('/api/presence', {
    method,
    headers: {
      'content-type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error(await readError(response, fallback))
  }

  const payload = (await response.json()) as PresenceMutationResponse
  if (!payload.entityKey || !payload.txHash || !isHex(payload.entityKey) || !isHex(payload.txHash)) {
    throw new Error(fallback)
  }

  return {
    entityKey: payload.entityKey as Hex,
    txHash: payload.txHash as Hex
  }
}

export async function joinPresence(input: JoinPresenceInput): Promise<{ entityKey: Hex; txHash: Hex }> {
  return callPresenceApi('POST', input, 'Could not join presence.')
}

export async function heartbeatPresence(entityKey: Hex): Promise<{ entityKey: Hex; txHash: Hex }> {
  return callPresenceApi('PATCH', { entityKey }, 'Could not renew presence.')
}

export async function leavePresence(entityKey: Hex): Promise<{ entityKey: Hex; txHash: Hex }> {
  return callPresenceApi('DELETE', { entityKey }, 'Could not leave presence.')
}
