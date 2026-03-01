import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  updateSpaceMock: vi.fn(),
  runWritePreflightMock: vi.fn(),
  formatWalletErrorMock: vi.fn(),
  ensureWalletReadSessionMock: vi.fn(),
  signMessageAsyncMock: vi.fn()
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
  }),
  useSignMessage: () => ({
    signMessageAsync: mocks.signMessageAsyncMock
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => ({})
}))

vi.mock('@/arkiv/mutations/spaces', () => ({
  updateSpace: mocks.updateSpaceMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: mocks.runWritePreflightMock,
  formatWalletError: mocks.formatWalletErrorMock
}))

vi.mock('@/features/auth/client-session', () => ({
  ensureWalletReadSession: mocks.ensureWalletReadSessionMock
}))

import { EditSpaceForm } from '@/app/_components/edit-space-form'

describe('edit space owner flow', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.updateSpaceMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()
    mocks.ensureWalletReadSessionMock.mockReset()
    mocks.signMessageAsyncMock.mockReset()

    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.updateSpaceMock.mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
    mocks.ensureWalletReadSessionMock.mockResolvedValue(undefined)
  })

  it('allows owner wallet to submit settings update', async () => {
    render(
      <EditSpaceForm
        space={{
          entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          owner: '0x1111111111111111111111111111111111111111',
          expiresAtBlock: 1000n,
          spaceSlug: 'arkiv-demo',
          visibility: 'public',
          status: 'active',
          updatedAtMs: 1000,
          payload: {
            name: 'Arkiv Demo',
            description: 'Original description',
            createdAt: '2026-02-24T10:00:00.000Z',
            updatedAt: '2026-02-24T10:00:00.000Z'
          }
        }}
      />
    )

    await userEvent.clear(screen.getByLabelText('Description'))
    await userEvent.type(screen.getByLabelText('Description'), 'Updated description')
    await userEvent.click(screen.getByRole('button', { name: 'Save Settings' }))

    expect(mocks.updateSpaceMock).toHaveBeenCalledTimes(1)
    expect(mocks.updateSpaceMock).toHaveBeenCalledWith(
      expect.anything(),
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      expect.objectContaining({
        createdAt: '2026-02-24T10:00:00.000Z',
        description: 'Updated description',
        spaceSlug: 'arkiv-demo'
      })
    )
    expect(mocks.pushMock).toHaveBeenCalledWith('/spaces/arkiv-demo')
  })

  it('verifies wallet session when updating visibility to private', async () => {
    render(
      <EditSpaceForm
        space={{
          entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          owner: '0x1111111111111111111111111111111111111111',
          expiresAtBlock: 1000n,
          spaceSlug: 'arkiv-demo',
          visibility: 'public',
          status: 'active',
          updatedAtMs: 1000,
          payload: {
            name: 'Arkiv Demo',
            description: 'Original description',
            createdAt: '2026-02-24T10:00:00.000Z',
            updatedAt: '2026-02-24T10:00:00.000Z'
          }
        }}
      />
    )

    await userEvent.selectOptions(screen.getByLabelText('Visibility'), 'private')
    await userEvent.click(screen.getByRole('button', { name: 'Save Settings' }))

    expect(mocks.ensureWalletReadSessionMock).toHaveBeenCalledTimes(1)
    expect(mocks.pushMock).toHaveBeenCalledWith('/spaces/arkiv-demo')
  })
})
