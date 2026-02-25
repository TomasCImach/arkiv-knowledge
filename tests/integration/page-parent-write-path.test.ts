import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listRevisionsByPageMock: vi.fn(),
  getPageBySlugMock: vi.fn(),
  listOutgoingLinksMock: vi.fn()
}))

vi.mock('@/arkiv/queries/pages', () => ({
  listRevisionsByPage: mocks.listRevisionsByPageMock,
  getPageBySlug: mocks.getPageBySlugMock
}))

vi.mock('@/arkiv/queries/links', () => ({
  listOutgoingLinks: mocks.listOutgoingLinksMock
}))

import { createPage, editPage } from '@/arkiv/mutations/pages'

function findAttr(
  attributes: Array<{ key: string; value: string | number }>,
  key: string
): string | number | undefined {
  return attributes.find((attribute) => attribute.key === key)?.value
}

describe('page mutation parent write path', () => {
  beforeEach(() => {
    mocks.listRevisionsByPageMock.mockReset()
    mocks.getPageBySlugMock.mockReset()
    mocks.listOutgoingLinksMock.mockReset()
  })

  it('writes selected parentPageKey during page creation', async () => {
    const createEntity = vi.fn().mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0x9999999999999999999999999999999999999999999999999999999999999999'
    })
    const mutateEntities = vi.fn().mockResolvedValue({
      txHash: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      createdEntities: [],
      updatedEntities: [],
      deletedEntities: [],
      extendedEntities: [],
      ownershipChanges: []
    })

    await createPage(
      {
        createEntity,
        mutateEntities
      } as never,
      {
        spaceKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        spaceSlug: 'space',
        pageSlug: 'child-page',
        title: 'Child Page',
        summary: 'Summary',
        status: 'published',
        bodyMarkdown: 'No links',
        editor: '0x1111111111111111111111111111111111111111',
        parentPageKey: '0x2222222222222222222222222222222222222222222222222222222222222222'
      }
    )

    const [createInput] = createEntity.mock.calls[0]
    expect(findAttr(createInput.attributes, 'parentPageKey')).toBe(
      '0x2222222222222222222222222222222222222222222222222222222222222222'
    )
  })

  it('writes selected parentPageKey during page edit update', async () => {
    mocks.listRevisionsByPageMock.mockResolvedValue([])
    mocks.listOutgoingLinksMock.mockResolvedValue([])

    const mutateEntities = vi.fn().mockResolvedValue({
      txHash: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      createdEntities: [],
      updatedEntities: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'],
      deletedEntities: [],
      extendedEntities: [],
      ownershipChanges: []
    })

    await editPage(
      {
        mutateEntities
      } as never,
      {
        spaceKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        spaceSlug: 'space',
        pageKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        pageSlug: 'child-page',
        title: 'Child Page',
        summary: 'Summary',
        status: 'published',
        bodyMarkdown: 'No links',
        editor: '0x1111111111111111111111111111111111111111',
        editSummary: 'set parent',
        parentPageKey: '0x2222222222222222222222222222222222222222222222222222222222222222'
      }
    )

    const [mutationInput] = mutateEntities.mock.calls[0]
    expect(findAttr(mutationInput.updates[0].attributes, 'parentPageKey')).toBe(
      '0x2222222222222222222222222222222222222222222222222222222222222222'
    )
  })
})
