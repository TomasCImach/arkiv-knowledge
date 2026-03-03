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

import { createPage } from '@/arkiv/mutations/pages'

describe('createPage repair path', () => {
  beforeEach(() => {
    mocks.listRevisionsByPageMock.mockReset()
    mocks.getPageBySlugInSpaceMock.mockReset()
    mocks.listOutgoingLinksMock.mockReset()
  })

  it('repairs initial revision when follow-up mutation fails', async () => {
    mocks.getPageBySlugInSpaceMock.mockResolvedValue(undefined)
    mocks.listRevisionsByPageMock.mockResolvedValue([])

    const createEntity = vi
      .fn()
      .mockResolvedValueOnce({
        entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        txHash: '0x1111111111111111111111111111111111111111111111111111111111111111'
      })
      .mockResolvedValueOnce({
        entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        txHash: '0x2222222222222222222222222222222222222222222222222222222222222222'
      })

    const mutateEntities = vi.fn().mockRejectedValue(new Error('follow-up failed'))

    const result = await createPage(
      {
        createEntity,
        mutateEntities
      } as never,
      {
        spaceKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        spaceSlug: 'space',
        pageSlug: 'getting-started',
        title: 'Getting Started',
        summary: 'Summary',
        status: 'published',
        bodyMarkdown: 'No links',
        editor: '0xdddddddddddddddddddddddddddddddddddddddd'
      }
    )

    expect(result.pageKey).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    expect(result.txHash).toBe('0x2222222222222222222222222222222222222222222222222222222222222222')
    expect(mutateEntities).toHaveBeenCalledTimes(1)
    expect(createEntity).toHaveBeenCalledTimes(2)
    expect(mocks.listRevisionsByPageMock).toHaveBeenCalledWith(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    )
  })

  it('throws actionable error when repair cannot ensure initial revision', async () => {
    mocks.getPageBySlugInSpaceMock.mockResolvedValue(undefined)
    mocks.listRevisionsByPageMock.mockResolvedValue([])

    const createEntity = vi
      .fn()
      .mockResolvedValueOnce({
        entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        txHash: '0x1111111111111111111111111111111111111111111111111111111111111111'
      })
      .mockRejectedValueOnce(new Error('repair revision failed'))

    const mutateEntities = vi.fn().mockRejectedValue(new Error('follow-up failed'))

    await expect(
      createPage(
        {
          createEntity,
          mutateEntities
        } as never,
        {
          spaceKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
          spaceSlug: 'space',
          pageSlug: 'getting-started',
          title: 'Getting Started',
          summary: 'Summary',
          status: 'published',
          bodyMarkdown: 'No links',
          editor: '0xdddddddddddddddddddddddddddddddddddddddd'
        }
      )
    ).rejects.toThrow('was created but revision/link follow-up failed')
  })
})
