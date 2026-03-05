import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentApiRequestError } from '@/features/agent/errors'

const mocks = vi.hoisted(() => ({
  requireAgentViewer: vi.fn()
}))

vi.mock('@/features/agent/auth', () => ({
  requireAgentViewer: mocks.requireAgentViewer
}))

import { POST as postSpaceUpdateIntent } from '@/app/api/agent/v1/intents/spaces/update/route'
import { POST as postPageDeleteIntent } from '@/app/api/agent/v1/intents/pages/delete/route'
import { POST as postPageTransferIntent } from '@/app/api/agent/v1/intents/pages/transfer/route'
import { POST as postExtendIntent } from '@/app/api/agent/v1/intents/entities/extend/route'

describe('agent intent routes auth enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAgentViewer.mockRejectedValue(
      new AgentApiRequestError('AUTH_REQUIRED', 'Wallet session verification required.', 401)
    )
  })

  it('returns AUTH_REQUIRED for space update intent without session', async () => {
    const response = await postSpaceUpdateIntent(
      new Request('http://localhost/api/agent/v1/intents/spaces/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          spaceSlug: 'demo',
          name: 'Demo',
          description: 'Updated',
          visibility: 'public'
        })
      })
    )

    const payload = (await response.json()) as { error: { code: string } }
    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('AUTH_REQUIRED')
  })

  it('returns AUTH_REQUIRED for page delete intent without session', async () => {
    const response = await postPageDeleteIntent(
      new Request('http://localhost/api/agent/v1/intents/pages/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          spaceSlug: 'demo',
          pageSlug: 'page-a'
        })
      })
    )

    const payload = (await response.json()) as { error: { code: string } }
    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('AUTH_REQUIRED')
  })

  it('returns AUTH_REQUIRED for page transfer intent without session', async () => {
    const response = await postPageTransferIntent(
      new Request('http://localhost/api/agent/v1/intents/pages/transfer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          spaceSlug: 'demo',
          pageSlug: 'page-a',
          newOwner: '0x2222222222222222222222222222222222222222'
        })
      })
    )

    const payload = (await response.json()) as { error: { code: string } }
    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('AUTH_REQUIRED')
  })

  it('returns AUTH_REQUIRED for extend intent without session', async () => {
    const response = await postExtendIntent(
      new Request('http://localhost/api/agent/v1/intents/entities/extend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          kind: 'space'
        })
      })
    )

    const payload = (await response.json()) as { error: { code: string } }
    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('AUTH_REQUIRED')
  })
})
