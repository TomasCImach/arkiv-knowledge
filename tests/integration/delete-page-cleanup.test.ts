import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listRevisionsByPageMock: vi.fn(),
  listOutgoingLinksMock: vi.fn(),
  listBacklinksMock: vi.fn(),
  listPresenceForPageMock: vi.fn()
}))

vi.mock('@/arkiv/queries/pages', () => ({
  getPageBySlugInSpace: vi.fn(),
  listRevisionsByPage: mocks.listRevisionsByPageMock
}))

vi.mock('@/arkiv/queries/links', () => ({
  listOutgoingLinks: mocks.listOutgoingLinksMock,
  listBacklinks: mocks.listBacklinksMock
}))

vi.mock('@/arkiv/queries/presence', () => ({
  listPresenceForPage: mocks.listPresenceForPageMock
}))

import { deletePageWithCleanup } from '@/arkiv/mutations/pages'

describe('deletePageWithCleanup', () => {
  beforeEach(() => {
    mocks.listRevisionsByPageMock.mockReset()
    mocks.listOutgoingLinksMock.mockReset()
    mocks.listBacklinksMock.mockReset()
    mocks.listPresenceForPageMock.mockReset()
  })

  it('deletes canonical page plus related revisions/links/presence in one mutation', async () => {
    const pageKey = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    mocks.listRevisionsByPageMock.mockResolvedValue([
      { entityKey: '0x1111111111111111111111111111111111111111111111111111111111111111' },
      { entityKey: '0x2222222222222222222222222222222222222222222222222222222222222222' }
    ])
    mocks.listOutgoingLinksMock.mockResolvedValue([
      { entityKey: '0x3333333333333333333333333333333333333333333333333333333333333333' },
      { entityKey: '0x4444444444444444444444444444444444444444444444444444444444444444' }
    ])
    mocks.listBacklinksMock.mockResolvedValue([
      { entityKey: '0x5555555555555555555555555555555555555555555555555555555555555555' }
    ])
    mocks.listPresenceForPageMock.mockResolvedValue([
      { entityKey: '0x6666666666666666666666666666666666666666666666666666666666666666' }
    ])

    const mutateEntities = vi.fn().mockResolvedValue({
      txHash: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      createdEntities: [],
      updatedEntities: [],
      deletedEntities: [],
      extendedEntities: [],
      ownershipChanges: []
    })
    const client = { mutateEntities }

    const result = await deletePageWithCleanup(client as never, pageKey)

    expect(mutateEntities).toHaveBeenCalledTimes(1)
    const [input] = mutateEntities.mock.calls[0]
    const deletedKeys = input.deletes.map((entry: { entityKey: string }) => entry.entityKey)
    expect(deletedKeys).toEqual(
      expect.arrayContaining([
        pageKey,
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333333333333333333333333333',
        '0x4444444444444444444444444444444444444444444444444444444444444444',
        '0x5555555555555555555555555555555555555555555555555555555555555555',
        '0x6666666666666666666666666666666666666666666666666666666666666666'
      ])
    )
    expect(result.deletedCounts).toEqual({
      revisions: 2,
      links: 3,
      presence: 1
    })
  })
})
