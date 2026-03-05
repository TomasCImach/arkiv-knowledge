import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireAgentViewer: vi.fn(),
  joinPresenceWithServerSigner: vi.fn()
}))

vi.mock('@/features/agent/auth', () => ({
  requireAgentViewer: mocks.requireAgentViewer
}))

vi.mock('@/arkiv/mutations/presence-server', () => ({
  joinPresenceWithServerSigner: mocks.joinPresenceWithServerSigner
}))

import { POST as postJoinPresence } from '@/app/api/agent/v1/presence/join/route'

describe('agent presence routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects viewer spoof attempts with FORBIDDEN', async () => {
    mocks.requireAgentViewer.mockResolvedValue('0x1111111111111111111111111111111111111111')

    const response = await postJoinPresence(
      new Request('http://localhost/api/agent/v1/presence/join', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          pageKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          viewer: '0x2222222222222222222222222222222222222222',
          sessionId: 'session-a',
          displayName: 'viewer'
        })
      })
    )

    const payload = (await response.json()) as { error: { code: string } }

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
    expect(mocks.joinPresenceWithServerSigner).not.toHaveBeenCalled()
  })
})
