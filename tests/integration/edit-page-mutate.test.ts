import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listRevisionsByPageMock: vi.fn(),
  getPageBySlugInSpaceMock: vi.fn(),
  listOutgoingLinksMock: vi.fn()
}))

vi.mock('@/arkiv/queries/pages', () => ({
  listRevisionsByPage: mocks.listRevisionsByPageMock,
  getPageBySlugInSpace: mocks.getPageBySlugInSpaceMock
}))

vi.mock('@/arkiv/queries/links', () => ({
  listOutgoingLinks: mocks.listOutgoingLinksMock
}))

import { editPage } from '@/arkiv/mutations/pages'

function decodeJsonPayload(payload: Uint8Array): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>
}

function findAttr(
  attributes: Array<{ key: string; value: string | number }>,
  key: string
): string | number | undefined {
  return attributes.find((attribute) => attribute.key === key)?.value
}

describe('editPage mutation flow', () => {
  beforeEach(() => {
    mocks.listRevisionsByPageMock.mockReset()
    mocks.getPageBySlugInSpaceMock.mockReset()
    mocks.listOutgoingLinksMock.mockReset()
  })

  it('uses canonical update + revision create and rewrites link edges', async () => {
    mocks.listRevisionsByPageMock.mockResolvedValue([{ revisionNo: 1 }, { revisionNo: 3 }])
    mocks.listOutgoingLinksMock.mockResolvedValue([
      {
        entityKey: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      }
    ])
    mocks.getPageBySlugInSpaceMock.mockImplementation(async (_spaceKey: string, slug: string) => {
      if (slug === 'source') {
        return {
          entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          payload: {
            createdAt: '2026-02-20T10:00:00.000Z'
          }
        }
      }

      return {
        entityKey: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        payload: {
          createdAt: '2026-02-20T10:00:00.000Z'
        }
      }
    })

    const mutateEntities = vi.fn().mockResolvedValue({
      txHash: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      createdEntities: ['0x1234567890123456789012345678901234567890123456789012345678901234'],
      updatedEntities: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'],
      deletedEntities: ['0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'],
      extendedEntities: [],
      ownershipChanges: []
    })

    const walletClient = {
      mutateEntities
    }

    const result = await editPage(walletClient as never, {
      spaceKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      spaceSlug: 'space',
      pageKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pageSlug: 'source',
      title: 'Updated',
      summary: 'Summary',
      status: 'published',
      bodyMarkdown: 'with [[target-page]]',
      editor: '0x9999999999999999999999999999999999999999',
      editSummary: 'update'
    })

    expect(result.pageKey).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    expect(mutateEntities).toHaveBeenCalledTimes(1)

    const [mutationInput] = mutateEntities.mock.calls[0]
    const pagePayload = decodeJsonPayload(mutationInput.updates[0].payload)

    expect(mutationInput.updates).toHaveLength(1)
    expect(mutationInput.creates.length).toBeGreaterThanOrEqual(2)
    expect(pagePayload.createdAt).toBe('2026-02-20T10:00:00.000Z')
    expect(findAttr(mutationInput.creates[0].attributes, 'revisionNo')).toBe(4)
    expect(mutationInput.deletes).toEqual([
      {
        entityKey: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      }
    ])
  })
})
