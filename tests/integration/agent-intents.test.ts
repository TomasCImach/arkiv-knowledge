import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Hex } from 'viem'

const mocks = vi.hoisted(() => ({
  getSpaceBySlug: vi.fn(),
  getPageBySlugInSpace: vi.fn(),
  listRevisionsByPage: vi.fn(),
  listOutgoingLinks: vi.fn(),
  listBacklinks: vi.fn(),
  listPresenceForPage: vi.fn(),
  queryByEntityKey: vi.fn()
}))

vi.mock('@/arkiv/queries/spaces', () => ({
  getSpaceBySlug: mocks.getSpaceBySlug
}))

vi.mock('@/arkiv/queries/pages', () => ({
  getPageBySlugInSpace: mocks.getPageBySlugInSpace,
  listRevisionsByPage: mocks.listRevisionsByPage
}))

vi.mock('@/arkiv/queries/links', () => ({
  listOutgoingLinks: mocks.listOutgoingLinks,
  listBacklinks: mocks.listBacklinks
}))

vi.mock('@/arkiv/queries/presence', () => ({
  listPresenceForPage: mocks.listPresenceForPage
}))

vi.mock('@/arkiv/queries/base', () => ({
  queryByEntityKey: mocks.queryByEntityKey
}))

import {
  buildCreatePageIntent,
  buildDeletePageIntent,
  buildExtendEntityIntent,
  buildTransferPageIntent,
  buildUpdatePageIntent,
  buildUpdateSpaceIntent
} from '@/features/agent/intents'

const OWNER = '0x1111111111111111111111111111111111111111' as Hex
const OTHER = '0x2222222222222222222222222222222222222222' as Hex

function decodePayload(payload: number[]): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(new Uint8Array(payload))) as Record<string, unknown>
}

function findAttr(attributes: Array<{ key: string; value: string | number }>, key: string) {
  return attributes.find((attribute) => attribute.key === key)?.value
}

function buildSpace(overrides: Record<string, unknown> = {}) {
  return {
    entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    owner: OWNER,
    expiresAtBlock: 11n,
    spaceSlug: 'demo',
    visibility: 'public',
    status: 'active',
    updatedAtMs: 1,
    payload: {
      name: 'Demo',
      description: 'Demo space',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    },
    ...overrides
  }
}

function buildPage(overrides: Record<string, unknown> = {}) {
  return {
    entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    owner: OWNER,
    expiresAtBlock: 12n,
    spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    spaceSlug: 'demo',
    pageSlug: 'welcome',
    title: 'Welcome',
    status: 'published',
    updatedAtMs: 2,
    payload: {
      title: 'Welcome',
      summary: 'Initial summary',
      bodyMarkdown: 'Body',
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-06T00:00:00.000Z'
    },
    ...overrides
  }
}

describe('agent write intent builders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds pages.update intent with stable createdAt and monotonic revision number', async () => {
    mocks.getSpaceBySlug.mockResolvedValue(buildSpace())
    mocks.getPageBySlugInSpace.mockResolvedValue(buildPage())
    mocks.listRevisionsByPage.mockResolvedValue([
      {
        entityKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        revisionNo: 1
      },
      {
        entityKey: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        revisionNo: 3
      }
    ])
    mocks.listOutgoingLinks.mockResolvedValue([])

    const intent = await buildUpdatePageIntent(OWNER, {
      spaceSlug: 'demo',
      pageSlug: 'welcome',
      title: 'Welcome updated',
      summary: 'Updated summary',
      bodyMarkdown: 'Updated body',
      status: 'published',
      editSummary: 'Agent update'
    })

    expect(intent.sdkCall.method).toBe('mutateEntities')
    if (intent.sdkCall.method !== 'mutateEntities') {
      throw new Error('Unexpected sdk call type.')
    }

    const update = intent.sdkCall.params.updates?.[0]
    const revision = intent.sdkCall.params.creates?.[0]

    expect(update).toBeDefined()
    expect(revision).toBeDefined()

    const updatePayload = decodePayload(update?.payload ?? [])
    expect(updatePayload.createdAt).toBe('2026-01-05T00:00:00.000Z')
    expect(findAttr(update?.attributes ?? [], 'spaceSlug')).toBe('demo')
    expect(findAttr(revision?.attributes ?? [], 'revisionNo')).toBe(4)
  })

  it('builds pages.delete intent with canonical cleanup entity keys', async () => {
    mocks.getSpaceBySlug.mockResolvedValue(buildSpace())
    mocks.getPageBySlugInSpace.mockResolvedValue(buildPage())
    mocks.listRevisionsByPage.mockResolvedValue([
      { entityKey: '0x1111111111111111111111111111111111111111111111111111111111111111' }
    ])
    mocks.listOutgoingLinks.mockResolvedValue([
      { entityKey: '0x2222222222222222222222222222222222222222222222222222222222222222' }
    ])
    mocks.listBacklinks.mockResolvedValue([
      { entityKey: '0x3333333333333333333333333333333333333333333333333333333333333333' }
    ])
    mocks.listPresenceForPage.mockResolvedValue([
      { entityKey: '0x4444444444444444444444444444444444444444444444444444444444444444' }
    ])

    const intent = await buildDeletePageIntent(OWNER, {
      spaceSlug: 'demo',
      pageSlug: 'welcome'
    })

    expect(intent.sdkCall.method).toBe('mutateEntities')
    if (intent.sdkCall.method !== 'mutateEntities') {
      throw new Error('Unexpected sdk call type.')
    }

    const deletedKeys = (intent.sdkCall.params.deletes ?? []).map((entry) => entry.entityKey)
    expect(new Set(deletedKeys)).toEqual(
      new Set([
        '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333333333333333333333333333',
        '0x4444444444444444444444444444444444444444444444444444444444444444'
      ])
    )
  })

  it('builds spaces.update intent preserving immutable createdAt and slug', async () => {
    mocks.getSpaceBySlug.mockResolvedValue(buildSpace())

    const intent = await buildUpdateSpaceIntent(OWNER, {
      spaceSlug: 'demo',
      name: 'Demo next',
      description: 'Updated',
      visibility: 'private',
      status: 'active'
    })

    expect(intent.sdkCall.method).toBe('updateEntity')
    if (intent.sdkCall.method !== 'updateEntity') {
      throw new Error('Unexpected sdk call type.')
    }

    const payload = decodePayload(intent.sdkCall.params.payload)
    expect(payload.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(findAttr(intent.sdkCall.params.attributes, 'spaceSlug')).toBe('demo')
  })

  it('returns CONFLICT for pages.create when slug already exists', async () => {
    mocks.getSpaceBySlug.mockResolvedValue(buildSpace())
    mocks.getPageBySlugInSpace.mockResolvedValue(buildPage())

    await expect(
      buildCreatePageIntent(OWNER, {
        spaceSlug: 'demo',
        pageSlug: 'welcome',
        title: 'Welcome',
        summary: 'Summary',
        bodyMarkdown: 'Body',
        status: 'published'
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT'
    })
  })

  it('returns FORBIDDEN for non-owner update/delete/transfer/extend operations', async () => {
    mocks.getSpaceBySlug.mockResolvedValue(buildSpace({ owner: OWNER }))
    mocks.getPageBySlugInSpace.mockResolvedValue(buildPage({ owner: OWNER }))
    mocks.queryByEntityKey.mockResolvedValue({
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      owner: OWNER
    })

    await expect(
      buildUpdateSpaceIntent(OTHER, {
        spaceSlug: 'demo',
        name: 'Name',
        description: 'Desc',
        visibility: 'public'
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })

    await expect(
      buildDeletePageIntent(OTHER, {
        spaceSlug: 'demo',
        pageSlug: 'welcome'
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })

    await expect(
      buildTransferPageIntent(OTHER, {
        spaceSlug: 'demo',
        pageSlug: 'welcome',
        newOwner: OTHER
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })

    await expect(
      buildExtendEntityIntent(OTHER, {
        entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        kind: 'space'
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
