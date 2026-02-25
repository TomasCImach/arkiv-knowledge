import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  transferEntityOwnershipMock: vi.fn(),
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

vi.mock('@/arkiv/mutations/ownership', () => ({
  transferEntityOwnership: mocks.transferEntityOwnershipMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: mocks.runWritePreflightMock,
  formatWalletError: mocks.formatWalletErrorMock
}))

import { TransferOwnershipForm } from '@/app/_components/transfer-ownership-form'

describe('transfer ownership form', () => {
  beforeEach(() => {
    mocks.refreshMock.mockReset()
    mocks.transferEntityOwnershipMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()
    mocks.accountState.isConnected = true
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'
    mocks.accountState.chainId = 60138453025

    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.transferEntityOwnershipMock.mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
  })

  it('supports owner transfer and enforces handoff permissions', async () => {
    const { rerender } = render(
      <TransferOwnershipForm
        entityKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        entityOwner="0x1111111111111111111111111111111111111111"
        entityLabel="page"
      />
    )

    await userEvent.type(screen.getByLabelText('New owner wallet'), '0x2222222222222222222222222222222222222222')
    await userEvent.click(screen.getByRole('button', { name: 'Transfer page ownership' }))

    expect(mocks.transferEntityOwnershipMock).toHaveBeenCalledWith(
      expect.anything(),
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0x2222222222222222222222222222222222222222'
    )

    rerender(
      <TransferOwnershipForm
        entityKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        entityOwner="0x2222222222222222222222222222222222222222"
        entityLabel="page"
      />
    )

    expect(screen.getByText('Only owner can transfer page ownership.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Transfer page ownership' })).toBeDisabled()

    mocks.accountState.address = '0x2222222222222222222222222222222222222222'
    rerender(
      <TransferOwnershipForm
        entityKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        entityOwner="0x2222222222222222222222222222222222222222"
        entityLabel="page"
      />
    )

    expect(screen.queryByText('Only owner can transfer page ownership.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Transfer page ownership' })).toBeEnabled()
  })
})
