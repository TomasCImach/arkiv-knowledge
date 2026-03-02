import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ParsedSpace } from '@/arkiv/types'

const mocks = vi.hoisted(() => ({
  listSpacesMock: vi.fn(),
  listSpacesOwnedByMock: vi.fn(),
  getAuthenticatedViewerAddressMock: vi.fn()
}))

const basePayload = {
  name: 'Base Space',
  description: 'Base description',
  createdAt: '2026-03-02T00:00:00.000Z',
  updatedAt: '2026-03-02T00:00:00.000Z'
}

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement('a', { href, className }, children)
}))

vi.mock('@/app/_components/wallet-status', () => ({
  WalletStatus: () => React.createElement('div', null, 'Wallet Status')
}))

vi.mock('@/arkiv/queries', () => ({
  listSpaces: mocks.listSpacesMock,
  listSpacesOwnedBy: mocks.listSpacesOwnedByMock
}))

vi.mock('@/features/auth/session', () => ({
  getAuthenticatedViewerAddress: mocks.getAuthenticatedViewerAddressMock
}))

function buildSpace(overrides: Partial<ParsedSpace>): ParsedSpace {
  return {
    entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    owner: '0x1111111111111111111111111111111111111111',
    expiresAtBlock: 1000n,
    spaceSlug: 'base-space',
    visibility: 'public',
    status: 'active',
    updatedAtMs: Date.parse('2026-03-02T00:00:00.000Z'),
    payload: {
      ...basePayload
    },
    ...overrides
  }
}

describe('app shell private navigation', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.listSpacesMock.mockReset()
    mocks.listSpacesOwnedByMock.mockReset()
    mocks.getAuthenticatedViewerAddressMock.mockReset()
    mocks.listSpacesMock.mockResolvedValue([])
    mocks.listSpacesOwnedByMock.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('shows only public spaces when wallet session is not verified', async () => {
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue(undefined)
    mocks.listSpacesMock.mockResolvedValue([
      buildSpace({ payload: { ...basePayload, name: 'Public Docs' }, spaceSlug: 'public-docs', visibility: 'public' }),
      buildSpace({
        entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        payload: { ...basePayload, name: 'Private Docs' },
        spaceSlug: 'private-docs',
        visibility: 'private'
      })
    ])

    const { AppShell } = await import('@/app/_components/app-shell')
    const element = await AppShell({ children: React.createElement('div', null, 'Body') })
    render(element)

    expect(screen.getAllByText('Public Docs').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Private Docs')).toHaveLength(0)
    expect(mocks.listSpacesOwnedByMock).not.toHaveBeenCalled()
  })

  it('adds owned private/unlisted spaces after wallet verification', async () => {
    const viewer = '0x1111111111111111111111111111111111111111'
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue(viewer)
    mocks.listSpacesMock.mockResolvedValue([
      buildSpace({ payload: { ...basePayload, name: 'Public Docs' }, spaceSlug: 'public-docs', visibility: 'public' })
    ])
    mocks.listSpacesOwnedByMock.mockResolvedValue([
      buildSpace({
        entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        payload: { ...basePayload, name: 'Private Docs' },
        spaceSlug: 'private-docs',
        visibility: 'private',
        updatedAtMs: Date.parse('2026-03-02T01:00:00.000Z')
      }),
      buildSpace({
        entityKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        payload: { ...basePayload, name: 'Unlisted Docs' },
        spaceSlug: 'unlisted-docs',
        visibility: 'unlisted',
        updatedAtMs: Date.parse('2026-03-02T02:00:00.000Z')
      })
    ])

    const { AppShell } = await import('@/app/_components/app-shell')
    const element = await AppShell({ children: React.createElement('div', null, 'Body') })
    render(element)

    expect(mocks.listSpacesOwnedByMock).toHaveBeenCalledWith(viewer, 200)
    expect(screen.getAllByText('Spaces (Public + Owned)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Public Docs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Private Docs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unlisted Docs').length).toBeGreaterThan(0)
  })
})
