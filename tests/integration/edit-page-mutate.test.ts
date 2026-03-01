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

describe('editPage mutation flow', () => {
  beforeEach(() => {
    mocks.listRevisionsByPageMock.mockReset()
    mocks.getPageBySlugInSpaceMock.mockReset()
    mocks.listOutgoingLinksMock.mockReset()
  })

  it('uses canonical update + revision create and rewrites link edges', async () => {
    mocks.listRevisionsByPageMock.mockResolvedValue([{ revisionNo: 1 }, { revisionNo: 2 }])
    mocks.listOutgoingLinksMock.mockResolvedValue([
      {
        entityKey: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      }
    ])
    mocks.getPageBySlugInSpaceMock.mockResolvedValue({
      entityKey: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
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

    expect(mutationInput.updates).toHaveLength(1)
    expect(mutationInput.creates.length).toBeGreaterThanOrEqual(2)
    expect(mutationInput.deletes).toEqual([
      {
        entityKey: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      }
    ])
  })
})
