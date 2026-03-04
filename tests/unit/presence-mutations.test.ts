import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Hex } from 'viem'
import { heartbeatPresence, joinPresence, leavePresence } from '@/arkiv/mutations/presence'

const SPACE_KEY = `0x${'a'.repeat(64)}` as Hex
const PAGE_KEY = `0x${'b'.repeat(64)}` as Hex
const ENTITY_KEY = `0x${'c'.repeat(64)}` as Hex
const TX_HASH = `0x${'d'.repeat(64)}` as Hex
const VIEWER = `0x${'1'.repeat(40)}` as Hex

describe('presence mutation API client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('joins presence via server API', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ entityKey: ENTITY_KEY, txHash: TX_HASH }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    )

    const result = await joinPresence({
      spaceKey: SPACE_KEY,
      pageKey: PAGE_KEY,
      viewer: VIEWER,
      sessionId: 'session-a',
      displayName: 'viewer-a'
    })

    expect(result).toEqual({
      entityKey: ENTITY_KEY,
      txHash: TX_HASH
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/presence')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      spaceKey: SPACE_KEY,
      pageKey: PAGE_KEY,
      viewer: VIEWER,
      sessionId: 'session-a',
      displayName: 'viewer-a'
    })
  })

  it('renews presence via PATCH endpoint and propagates API errors', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'renew failed' }), {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      })
    )

    await expect(heartbeatPresence(ENTITY_KEY)).rejects.toThrow('renew failed')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('PATCH')
  })

  it('throws fallback error when API response is malformed', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ entityKey: 'bad', txHash: 'bad' }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    )

    await expect(leavePresence(ENTITY_KEY)).rejects.toThrow('Could not leave presence.')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('DELETE')
  })
})
