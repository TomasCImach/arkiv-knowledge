import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ParsedSpace } from '@/arkiv/types'

const mocks = vi.hoisted(() => ({
  getAuthenticatedViewerAddressMock: vi.fn(),
  listSpacesOwnedByMock: vi.fn()
}))

const basePayload = {
  name: 'Alpha',
  description: 'Alpha description',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z'
}

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => React.createElement('a', { href }, children)
}))

vi.mock('@/app/_components/breadcrumbs', () => ({
  Breadcrumbs: () => React.createElement('nav')
}))

vi.mock('@/features/auth/session', () => ({
  getAuthenticatedViewerAddress: mocks.getAuthenticatedViewerAddressMock
}))

vi.mock('@/arkiv/queries', () => ({
  listSpacesOwnedBy: mocks.listSpacesOwnedByMock
}))

function buildSpace(overrides: Partial<ParsedSpace>): ParsedSpace {
  return {
    entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    owner: '0x1111111111111111111111111111111111111111',
    expiresAtBlock: 1000n,
    spaceSlug: 'alpha',
    visibility: 'public',
    status: 'active',
    updatedAtMs: Date.now(),
    payload: {
      ...basePayload
    },
    ...overrides
  }
}

describe('my spaces route', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.getAuthenticatedViewerAddressMock.mockReset()
    mocks.listSpacesOwnedByMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows guidance when wallet private-read session is not authenticated', async () => {
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue(undefined)
    const { default: MySpacesPage } = await import('@/app/my/spaces/page')
    const element = await MySpacesPage()
    render(element)

    expect(screen.getByRole('heading', { name: 'My Spaces' })).toBeInTheDocument()
    expect(
      screen.getByText('Verify private access in the header after connecting your wallet to list your private and unlisted spaces.')
    ).toBeInTheDocument()
    expect(mocks.listSpacesOwnedByMock).not.toHaveBeenCalled()
  })

  it('lists owned spaces including private and unlisted visibility', async () => {
    mocks.getAuthenticatedViewerAddressMock.mockResolvedValue('0x1111111111111111111111111111111111111111')
    mocks.listSpacesOwnedByMock.mockResolvedValue([
      buildSpace({ visibility: 'private', spaceSlug: 'private-docs', payload: { ...basePayload, name: 'Private Docs' } }),
      buildSpace({
        entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        visibility: 'unlisted',
        spaceSlug: 'unlisted-docs',
        payload: { ...basePayload, name: 'Unlisted Docs' }
      })
    ])

    const { default: MySpacesPage } = await import('@/app/my/spaces/page')
    const element = await MySpacesPage()
    render(element)

    expect(mocks.listSpacesOwnedByMock).toHaveBeenCalledWith('0x1111111111111111111111111111111111111111', 200)
    expect(screen.getByText('Private Docs')).toBeInTheDocument()
    expect(screen.getByText('Unlisted Docs')).toBeInTheDocument()
    expect(screen.getAllByText('private').length).toBeGreaterThan(0)
    expect(screen.getAllByText('unlisted').length).toBeGreaterThan(0)
  })
})
