import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ParsedPage, ParsedSpace } from '@/arkiv/types'

const mocks = vi.hoisted(() => ({
  getSpaceBySlugMock: vi.fn(),
  listPagesBySpaceKeyMock: vi.fn(),
  fetchCurrentBlockMock: vi.fn(),
  searchPagesMock: vi.fn(),
  buildPageSearchPredicatesMock: vi.fn(),
  listSpacesMock: vi.fn(),
  searchPagesGlobalMock: vi.fn(),
  buildGlobalPageSearchPredicatesMock: vi.fn(),
  getAuthenticatedViewerAddressMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  }
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => React.createElement('a', { href }, children)
}))

vi.mock('@/app/_components/breadcrumbs', () => ({
  Breadcrumbs: () => React.createElement('nav')
}))

vi.mock('@/app/_components/extend-entity-button', () => ({
  ExtendEntityButton: () => React.createElement('button')
}))

vi.mock('@/app/_components/page-tree-nav', () => ({
  PageTreeNav: () => React.createElement('div')
}))

vi.mock('@/app/_components/query-debug-panel', () => ({
  QueryDebugPanel: () => React.createElement('div')
}))

vi.mock('@/app/_components/realtime-refresh', () => ({
  RealtimeRefresh: () => null
}))

vi.mock('@/app/_components/space-search-form', () => ({
  SpaceSearchForm: () => React.createElement('form')
}))

vi.mock('@/app/_components/edit-space-form', () => ({
  EditSpaceForm: () => React.createElement('form', null, 'Edit Space Form')
}))

vi.mock('@/app/_components/transfer-ownership-form', () => ({
  TransferOwnershipForm: () => React.createElement('form', null, 'Transfer Ownership Form')
}))

vi.mock('@/arkiv/queries', () => ({
  getSpaceBySlug: mocks.getSpaceBySlugMock,
  listPagesBySpaceKey: mocks.listPagesBySpaceKeyMock,
  fetchCurrentBlock: mocks.fetchCurrentBlockMock,
  searchPages: mocks.searchPagesMock,
  buildPageSearchPredicates: mocks.buildPageSearchPredicatesMock,
  listSpaces: mocks.listSpacesMock,
  searchPagesGlobal: mocks.searchPagesGlobalMock,
  buildGlobalPageSearchPredicates: mocks.buildGlobalPageSearchPredicatesMock
}))

vi.mock('@/features/auth/session', () => ({
  getAuthenticatedViewerAddress: mocks.getAuthenticatedViewerAddressMock
}))

const OWNER = '0x1111111111111111111111111111111111111111'

function buildSpace(visibility: ParsedSpace['visibility']): ParsedSpace {
  return {
    entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    owner: OWNER,
    expiresAtBlock: 1000n,
    spaceSlug: 'private-space',
    visibility,
    status: 'active',
    updatedAtMs: Date.now(),
    payload: {
      name: 'Private Space',
      description: 'Private docs',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    }
  }
}

function buildPage(spaceKey: `0x${string}`, spaceSlug: string, pageSlug: string, title: string): ParsedPage {
  return {
    entityKey: `0x${pageSlug.padEnd(64, 'a').slice(0, 64)}`,
    owner: OWNER,
    expiresAtBlock: 1000n,
    spaceKey,
    spaceSlug,
    pageSlug,
    title,
    status: 'published',
    updatedAtMs: Date.now(),
    payload: {
      title,
      summary: title,
      bodyMarkdown: title,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    }
  }
}

describe('private visibility route enforcement', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.getSpaceBySlugMock.mockReset()
    mocks.listPagesBySpaceKeyMock.mockReset()
    mocks.fetchCurrentBlockMock.mockReset()
    mocks.searchPagesMock.mockReset()
    mocks.buildPageSearchPredicatesMock.mockReset()
    mocks.listSpacesMock.mockReset()
    mocks.searchPagesGlobalMock.mockReset()
    mocks.buildGlobalPageSearchPredicatesMock.mockReset()
    mocks.getAuthenticatedViewerAddressMock.mockReset()

    mocks.getSpaceBySlugMock.mockResolvedValue(buildSpace('private'))
    mocks.listPagesBySpaceKeyMock.mockResolvedValue([])
    mocks.fetchCurrentBlockMock.mockResolvedValue(1000n)
    mocks.searchPagesMock.mockResolvedValue([])
    mocks.buildPageSearchPredicatesMock.mockReturnValue([])
    mocks.buildGlobalPageSearchPredicatesMock.mockReturnValue([])
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('blocks disconnected viewers from private space route', async () => {
    const { default: SpacePage } = await import('@/app/spaces/[spaceSlug]/page')

    await expect(
      SpacePage({
        params: Promise.resolve({ spaceSlug: 'private-space' }),
        searchParams: Promise.resolve({})
      })
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('allows authenticated owner wallet to load private space and settings routes', async () => {
    const { default: SpacePage } = await import('@/app/spaces/[spaceSlug]/page')
    const { default: SpaceSettingsRoute } = await import('@/app/spaces/[spaceSlug]/settings/page')
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue(OWNER)

    const spaceElement = await SpacePage({
      params: Promise.resolve({ spaceSlug: 'private-space' }),
      searchParams: Promise.resolve({})
    })
    render(spaceElement)
    expect(screen.getByRole('heading', { name: 'Private Space' })).toBeInTheDocument()

    const settingsElement = await SpaceSettingsRoute({
      params: Promise.resolve({ spaceSlug: 'private-space' }),
      searchParams: Promise.resolve({})
    })
    render(settingsElement)
    expect(screen.getByText('Edit Space Form')).toBeInTheDocument()
  })

  it('excludes private pages from global search for non-owners', async () => {
    const publicSpace: ParsedSpace = { ...buildSpace('public'), entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', spaceSlug: 'public-space' }
    const privateSpace = buildSpace('private')
    mocks.listSpacesMock.mockResolvedValue([publicSpace, privateSpace])
    mocks.searchPagesGlobalMock.mockResolvedValue([
      buildPage(publicSpace.entityKey, publicSpace.spaceSlug, 'public-doc', 'Public Document'),
      buildPage(privateSpace.entityKey, privateSpace.spaceSlug, 'private-doc', 'Private Document')
    ])

    const { default: GlobalSearchPage } = await import('@/app/search/pages/page')

    const publicElement = await GlobalSearchPage({
      searchParams: Promise.resolve({ q: 'document' })
    })
    render(publicElement)
    expect(screen.getAllByText('Public Document').length).toBeGreaterThan(0)
    expect(screen.queryByText('Private Document')).not.toBeInTheDocument()
  })
})
