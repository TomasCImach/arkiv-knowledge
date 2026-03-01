import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  createSpaceMock: vi.fn(),
  formatWalletErrorMock: vi.fn(),
  runWritePreflightMock: vi.fn(),
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
  createSpace: mocks.createSpaceMock
}))

vi.mock('@/lib/wallet', () => ({
  formatWalletError: mocks.formatWalletErrorMock,
  runWritePreflight: mocks.runWritePreflightMock
}))

vi.mock('@/features/auth/client-session', () => ({
  ensureWalletReadSession: mocks.ensureWalletReadSessionMock
}))

import { CreateSpaceForm } from '@/app/_components/create-space-form'

describe('create space error handling', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.createSpaceMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.ensureWalletReadSessionMock.mockReset()
    mocks.signMessageAsyncMock.mockReset()

    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.formatWalletErrorMock.mockReturnValue('Readable failure message')
    mocks.ensureWalletReadSessionMock.mockResolvedValue(undefined)
  })

  it('renders formatted transaction errors instead of undefined message', async () => {
    mocks.createSpaceMock.mockRejectedValue({ message: 'Transaction failed: undefined' })

    render(<CreateSpaceForm />)

    await userEvent.type(screen.getByLabelText('Space name'), 'My Space')
    await userEvent.type(screen.getByLabelText('Description'), 'Details')
    await userEvent.click(screen.getByRole('button', { name: 'Create Space' }))

    expect(mocks.createSpaceMock).toHaveBeenCalledTimes(1)
    expect(mocks.formatWalletErrorMock).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Readable failure message')).toBeInTheDocument()
  })

  it('verifies wallet session before redirecting private spaces', async () => {
    mocks.createSpaceMock.mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })

    render(<CreateSpaceForm />)

    await userEvent.type(screen.getByLabelText('Space name'), 'Private Space')
    await userEvent.type(screen.getByLabelText('Description'), 'Owner-only notes')
    await userEvent.selectOptions(screen.getByLabelText('Visibility'), 'private')
    await userEvent.click(screen.getByRole('button', { name: 'Create Space' }))

    expect(mocks.ensureWalletReadSessionMock).toHaveBeenCalledTimes(1)
    expect(mocks.pushMock).toHaveBeenCalledWith('/spaces/private-space')
    expect(mocks.refreshMock).toHaveBeenCalledTimes(1)
  })
})
