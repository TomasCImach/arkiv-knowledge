import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ParsedSpace } from '@/arkiv/types'

const mocks = vi.hoisted(() => ({
  listSpaces: vi.fn(),
  getSpaceBySlug: vi.fn(),
  getAgentViewer: vi.fn()
}))

vi.mock('@/arkiv/queries/spaces', () => ({
  listSpaces: mocks.listSpaces,
  getSpaceBySlug: mocks.getSpaceBySlug
}))

vi.mock('@/features/agent/auth', () => ({
  getAgentViewer: mocks.getAgentViewer
}))

import { GET as listSpacesRoute } from '@/app/api/agent/v1/spaces/route'
import { GET as getSpaceRoute } from '@/app/api/agent/v1/spaces/[spaceSlug]/route'

function buildSpace(overrides: Partial<ParsedSpace>): ParsedSpace {
  return {
    entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    owner: '0x1111111111111111111111111111111111111111',
    expiresAtBlock: 123n,
    spaceSlug: 'demo-space',
    visibility: 'public',
    status: 'active',
    updatedAtMs: 1,
    payload: {
      name: 'Demo',
      description: 'Demo space',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    ...overrides
  }
}

describe('agent read routes visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists only public spaces for anonymous callers', async () => {
    mocks.listSpaces.mockResolvedValueOnce([
      buildSpace({ spaceSlug: 'public-space', visibility: 'public' }),
      buildSpace({ spaceSlug: 'unlisted-space', visibility: 'unlisted' }),
      buildSpace({ spaceSlug: 'private-space', visibility: 'private' })
    ])

    const response = await listSpacesRoute()
    const payload = (await response.json()) as { data: { items: Array<{ spaceSlug: string }>; total: number } }

    expect(response.status).toBe(200)
    expect(payload.data.total).toBe(1)
    expect(payload.data.items.map((item) => item.spaceSlug)).toEqual(['public-space'])
  })

  it('allows direct read of unlisted space without wallet session', async () => {
    mocks.getSpaceBySlug.mockResolvedValueOnce(buildSpace({ spaceSlug: 'unlisted-space', visibility: 'unlisted' }))
    mocks.getAgentViewer.mockResolvedValueOnce(undefined)

    const response = await getSpaceRoute(new Request('http://localhost/api/agent/v1/spaces/unlisted-space'), {
      params: Promise.resolve({ spaceSlug: 'unlisted-space' })
    })

    expect(response.status).toBe(200)
  })

  it('blocks anonymous access to private spaces', async () => {
    mocks.getSpaceBySlug.mockResolvedValueOnce(buildSpace({ spaceSlug: 'private-space', visibility: 'private' }))
    mocks.getAgentViewer.mockResolvedValueOnce(undefined)

    const response = await getSpaceRoute(new Request('http://localhost/api/agent/v1/spaces/private-space'), {
      params: Promise.resolve({ spaceSlug: 'private-space' })
    })
    const payload = (await response.json()) as { error: { code: string } }

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })
})
