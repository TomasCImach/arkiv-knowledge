import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  editPageMock: vi.fn(),
  runWritePreflightMock: vi.fn(),
  formatWalletErrorMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
    refresh: mocks.refreshMock
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
    address: '0x1111111111111111111111111111111111111111',
    chainId: 60138453025
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => ({})
}))

vi.mock('@/arkiv/mutations/pages', () => ({
  editPage: mocks.editPageMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: mocks.runWritePreflightMock,
  formatWalletError: mocks.formatWalletErrorMock
}))

import { EditPageForm } from '@/app/_components/edit-page-form'

describe('edit page parent guard', () => {
  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.editPageMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()
  })

  it('blocks invalid descendant parent selection before mutation', async () => {
    render(
      <EditPageForm
        spaceKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        spaceSlug="space"
        page={{
          entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          owner: '0x1111111111111111111111111111111111111111',
          expiresAtBlock: 1000n,
          spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          spaceSlug: 'space',
          pageSlug: 'current-page',
          title: 'Current Page',
          status: 'published',
          parentPageKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          updatedAtMs: 100,
          payload: {
            title: 'Current Page',
            bodyMarkdown: 'Body',
            summary: 'Summary',
            createdAt: '2026-02-24T00:00:00.000Z',
            updatedAt: '2026-02-24T00:00:00.000Z'
          }
        }}
        availableParents={[
          {
            entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            owner: '0x1111111111111111111111111111111111111111',
            expiresAtBlock: 1000n,
            spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            spaceSlug: 'space',
            pageSlug: 'current-page',
            title: 'Current Page',
            status: 'published',
            updatedAtMs: 100,
            payload: {
              title: 'Current Page',
              bodyMarkdown: 'Body',
              summary: 'Summary',
              createdAt: '2026-02-24T00:00:00.000Z',
              updatedAt: '2026-02-24T00:00:00.000Z'
            }
          },
          {
            entityKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            owner: '0x1111111111111111111111111111111111111111',
            expiresAtBlock: 1000n,
            spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            spaceSlug: 'space',
            pageSlug: 'child-page',
            title: 'Child Page',
            status: 'published',
            parentPageKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            updatedAtMs: 90,
            payload: {
              title: 'Child Page',
              bodyMarkdown: 'Body',
              summary: 'Summary',
              createdAt: '2026-02-24T00:00:00.000Z',
              updatedAt: '2026-02-24T00:00:00.000Z'
            }
          }
        ]}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save Page' }))

    expect(await screen.findByText('Invalid parent selection. Refresh and choose a different parent.')).toBeInTheDocument()
    expect(mocks.editPageMock).not.toHaveBeenCalled()
    expect(mocks.runWritePreflightMock).not.toHaveBeenCalled()
  })
})
