import { describe, expect, it } from 'vitest'
import { parsePageEntity } from '@/arkiv/schema/parser'

describe('entity parser', () => {
  it('parses a page entity into typed shape', () => {
    const entity = {
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      owner: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      expiresAtBlock: 120n,
      attributes: [
        { key: 'type', value: 'kb.page' },
        { key: 'schemaVersion', value: '1' },
        { key: 'spaceKey', value: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
        { key: 'spaceSlug', value: 'space' },
        { key: 'pageSlug', value: 'page' },
        { key: 'title', value: 'Page' },
        { key: 'status', value: 'published' },
        { key: 'updatedAtMs', value: 5 }
      ],
      toJson: () => ({
        title: 'Page',
        bodyMarkdown: 'Body',
        summary: 'Summary',
        createdAt: '2026-02-24T00:00:00.000Z',
        updatedAt: '2026-02-24T00:00:00.000Z'
      })
    } as never

    const parsed = parsePageEntity(entity)

    expect(parsed.pageSlug).toBe('page')
    expect(parsed.payload.bodyMarkdown).toBe('Body')
    expect(parsed.owner).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
  })
})
