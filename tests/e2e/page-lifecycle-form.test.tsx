import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  archivePageMock: vi.fn(),
  deletePageWithCleanupMock: vi.fn(),
  runWritePreflightMock: vi.fn(),
  formatWalletErrorMock: vi.fn(),
  accountState: {
    isConnected: true,
    address: '0x1111111111111111111111111111111111111111',
    chainId: 60138453025
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
    refresh: mocks.refreshMock
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: mocks.accountState.isConnected,
    address: mocks.accountState.address,
    chainId: mocks.accountState.chainId
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => ({})
}))

vi.mock('@/arkiv/mutations/pages', () => ({
  archivePage: mocks.archivePageMock,
  deletePageWithCleanup: mocks.deletePageWithCleanupMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: mocks.runWritePreflightMock,
  formatWalletError: mocks.formatWalletErrorMock
}))

import { PageLifecycleForm } from '@/app/_components/page-lifecycle-form'

const page = {
  entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  owner: '0x1111111111111111111111111111111111111111',
  expiresAtBlock: 1000n,
  spaceKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  spaceSlug: 'space',
  pageSlug: 'page',
  title: 'Page',
  status: 'published',
  updatedAtMs: 10,
  payload: {
    title: 'Page',
    bodyMarkdown: 'Body',
    summary: 'Summary',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z'
  }
} as const

describe('page lifecycle form', () => {
  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.archivePageMock.mockReset()
    mocks.deletePageWithCleanupMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()
    mocks.accountState.isConnected = true
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'

    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.archivePageMock.mockResolvedValue({
      txHash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
    })
    mocks.deletePageWithCleanupMock.mockResolvedValue({
      txHash: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      deletedCounts: { links: 2, revisions: 3, presence: 1 }
    })
  })

  it('enforces owner-only controls and runs archive/delete actions', async () => {
    const { rerender } = render(<PageLifecycleForm page={page} viewer="0x1111111111111111111111111111111111111111" />)

    await userEvent.click(screen.getByRole('button', { name: 'Archive Page' }))
    expect(mocks.archivePageMock).toHaveBeenCalledTimes(1)
    expect(mocks.refreshMock).toHaveBeenCalled()

    await userEvent.type(screen.getByPlaceholderText('page'), 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Page' }))
    expect(mocks.deletePageWithCleanupMock).toHaveBeenCalledWith(
      expect.anything(),
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    )
    expect(mocks.pushMock).toHaveBeenCalledWith('/spaces/space?viewer=0x1111111111111111111111111111111111111111')

    mocks.accountState.address = '0x2222222222222222222222222222222222222222'
    rerender(<PageLifecycleForm page={page} viewer="0x2222222222222222222222222222222222222222" />)
    expect(screen.getByText('Switch to the owner wallet to continue.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Archive Page' })).toBeDisabled()
  })
})
