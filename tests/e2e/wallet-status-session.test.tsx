import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  accountState: {
    isConnected: false,
    address: undefined as `0x${string}` | undefined
  },
  refreshMock: vi.fn(),
  signMessageAsyncMock: vi.fn(),
  clearWalletReadSessionMock: vi.fn(),
  ensureWalletReadSessionMock: vi.fn(),
  readWalletSessionAddressMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refreshMock
  })
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => React.createElement('button', { type: 'button' }, 'Connect Wallet'),
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: mocks.accountState.isConnected,
    address: mocks.accountState.address
  }),
  useSignMessage: () => ({
    signMessageAsync: mocks.signMessageAsyncMock
  })
}))

vi.mock('@/features/auth/client-session', () => ({
  clearWalletReadSession: mocks.clearWalletReadSessionMock,
  ensureWalletReadSession: mocks.ensureWalletReadSessionMock,
  readWalletSessionAddress: mocks.readWalletSessionAddressMock
}))

import { WalletStatusClient } from '@/app/_components/wallet-status-client'

describe('wallet status private-read session behavior', () => {
  beforeEach(() => {
    mocks.accountState.isConnected = false
    mocks.accountState.address = undefined
    mocks.refreshMock.mockReset()
    mocks.signMessageAsyncMock.mockReset()
    mocks.clearWalletReadSessionMock.mockReset()
    mocks.ensureWalletReadSessionMock.mockReset()
    mocks.readWalletSessionAddressMock.mockReset()
    mocks.readWalletSessionAddressMock.mockResolvedValue(undefined)
    mocks.ensureWalletReadSessionMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('does not clear private-read session on initial disconnected mount', async () => {
    render(<WalletStatusClient />)

    await waitFor(() => {
      expect(mocks.clearWalletReadSessionMock).not.toHaveBeenCalled()
    })
  })

  it('clears private-read session when wallet disconnects after being connected', async () => {
    mocks.accountState.isConnected = true
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'
    const { rerender } = render(<WalletStatusClient />)

    mocks.accountState.isConnected = false
    mocks.accountState.address = undefined
    rerender(<WalletStatusClient />)

    await waitFor(() => {
      expect(mocks.clearWalletReadSessionMock).toHaveBeenCalledTimes(1)
    })
  })

  it('refreshes the current route after successful private-read verification', async () => {
    mocks.accountState.isConnected = true
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'
    render(<WalletStatusClient />)

    await userEvent.click(screen.getByRole('button', { name: 'Verify Private Access' }))

    await waitFor(() => {
      expect(mocks.ensureWalletReadSessionMock).toHaveBeenCalledTimes(1)
      expect(mocks.refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
