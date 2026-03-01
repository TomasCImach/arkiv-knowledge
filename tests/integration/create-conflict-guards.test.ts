import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSpaceBySlugMock: vi.fn(),
  getPageBySlugInSpaceMock: vi.fn()
}))

vi.mock('@/arkiv/queries/spaces', () => ({
  getSpaceBySlug: mocks.getSpaceBySlugMock
}))

vi.mock('@/arkiv/queries/pages', () => ({
  getPageBySlugInSpace: mocks.getPageBySlugInSpaceMock
}))

import { createPage } from '@/arkiv/mutations/pages'
import { createSpace } from '@/arkiv/mutations/spaces'

describe('create conflict guards', () => {
  beforeEach(() => {
    mocks.getSpaceBySlugMock.mockReset()
    mocks.getPageBySlugInSpaceMock.mockReset()
  })

  it('blocks creating a space when slug already exists', async () => {
    mocks.getSpaceBySlugMock.mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    })

    const createEntity = vi.fn()

    await expect(
      createSpace(
        {
          createEntity
        } as never,
        {
          spaceSlug: 'arkiv-demo',
          name: 'Arkiv Demo',
          description: 'Desc',
          visibility: 'public'
        }
      )
    ).rejects.toThrow('already exists')

    expect(createEntity).not.toHaveBeenCalled()
  })

  it('blocks creating a page when slug already exists in the same space', async () => {
    mocks.getPageBySlugInSpaceMock.mockResolvedValue({
      entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })

    const createEntity = vi.fn()
    const mutateEntities = vi.fn()

    await expect(
      createPage(
        {
          createEntity,
          mutateEntities
        } as never,
        {
          spaceKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
          spaceSlug: 'arkiv-demo',
          pageSlug: 'getting-started',
          title: 'Getting Started',
          summary: 'Summary',
          status: 'published',
          bodyMarkdown: 'Body',
          editor: '0x2222222222222222222222222222222222222222'
        }
      )
    ).rejects.toThrow('already exists')

    expect(createEntity).not.toHaveBeenCalled()
    expect(mutateEntities).not.toHaveBeenCalled()
  })
})
