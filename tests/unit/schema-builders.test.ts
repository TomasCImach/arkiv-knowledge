import { describe, expect, it } from 'vitest'
import {
  buildLinkCreateEntity,
  buildPageCreateEntity,
  buildPresenceCreateEntity,
  buildRevisionCreateEntity,
  buildSpaceCreateEntity,
  EXPIRATION_SECONDS
} from '@/arkiv/schema'

function findAttr(
  attributes: Array<{ key: string; value: string | number }>,
  key: string
): string | number | undefined {
  return attributes.find((attribute) => attribute.key === key)?.value
}

describe('Arkiv schema builders', () => {
  it('builds space entities with required attributes and expiration', () => {
    const entity = buildSpaceCreateEntity({
      spaceSlug: 'alpha',
      visibility: 'public',
      status: 'active',
      updatedAtMs: 1000,
      payload: {
        name: 'Alpha',
        description: 'desc',
        createdAt: '2026-02-24T00:00:00.000Z',
        updatedAt: '2026-02-24T00:00:00.000Z'
      }
    })

    expect(entity.expiresIn).toBe(EXPIRATION_SECONDS.space)
    expect(findAttr(entity.attributes, 'type')).toBe('kb.space')
    expect(findAttr(entity.attributes, 'spaceSlug')).toBe('alpha')
    expect(findAttr(entity.attributes, 'schemaVersion')).toBe('1')
  })

  it('builds page entities with query tokens and deterministic identity attributes', () => {
    const entity = buildPageCreateEntity({
      spaceKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
      spaceSlug: 'alpha',
      pageSlug: 'getting-started',
      title: 'Getting Started',
      status: 'published',
      updatedAtMs: 2000,
      payload: {
        title: 'Getting Started',
        bodyMarkdown: 'hello world',
        summary: 'short',
        createdAt: '2026-02-24T00:00:00.000Z',
        updatedAt: '2026-02-24T00:00:00.000Z'
      },
      searchTokens: ['arkiv', 'guide', 'arkiv']
    })

    expect(entity.expiresIn).toBe(EXPIRATION_SECONDS.pagePublished)
    expect(findAttr(entity.attributes, 'type')).toBe('kb.page')
    expect(findAttr(entity.attributes, 'spaceSlug')).toBe('alpha')
    expect(findAttr(entity.attributes, 'pageSlug')).toBe('getting-started')
    expect(findAttr(entity.attributes, 'token_0')).toBe('arkiv')
    expect(findAttr(entity.attributes, 'token_1')).toBe('guide')
    const keys = entity.attributes.map((attribute) => attribute.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('builds revision/link/presence entities with expected types', () => {
    const revision = buildRevisionCreateEntity({
      spaceKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
      pageKey: '0x2222222222222222222222222222222222222222222222222222222222222222',
      revisionNo: 3,
      editedAtMs: 3000,
      editor: '0x3333333333333333333333333333333333333333',
      payload: {
        title: 'title',
        bodyMarkdown: 'body',
        editSummary: 'summary'
      }
    })

    const link = buildLinkCreateEntity({
      spaceKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
      fromPageKey: '0x2222222222222222222222222222222222222222222222222222222222222222',
      toPageKey: '0x4444444444444444444444444444444444444444444444444444444444444444',
      updatedAtMs: 4000,
      payload: {
        sourceSlug: 'a',
        targetSlug: 'b'
      }
    })

    const presence = buildPresenceCreateEntity({
      spaceKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
      pageKey: '0x2222222222222222222222222222222222222222222222222222222222222222',
      viewer: '0x5555555555555555555555555555555555555555',
      sessionId: 'session-1',
      payload: {
        displayName: 'viewer',
        joinedAt: '2026-02-24T00:00:00.000Z'
      }
    })

    expect(findAttr(revision.attributes, 'type')).toBe('kb.revision')
    expect(findAttr(link.attributes, 'type')).toBe('kb.link')
    expect(findAttr(presence.attributes, 'type')).toBe('kb.presence')
    expect(revision.expiresIn).toBe(EXPIRATION_SECONDS.revision)
    expect(link.expiresIn).toBe(EXPIRATION_SECONDS.link)
    expect(presence.expiresIn).toBe(EXPIRATION_SECONDS.presence)
  })
})
