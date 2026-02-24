import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  createSpaceMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
    refresh: mocks.refreshMock
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: false,
    address: undefined
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => undefined
}))

vi.mock('@/arkiv/mutations/spaces', () => ({
  createSpace: mocks.createSpaceMock
}))

import { CreateSpaceForm } from '@/app/_components/create-space-form'

describe('no-wallet browsing boundary', () => {
  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.createSpaceMock.mockReset()
  })

  it('keeps writes gated when wallet is disconnected', async () => {
    render(<CreateSpaceForm />)

    await userEvent.type(screen.getByLabelText('Space name'), 'My Space')
    await userEvent.type(screen.getByLabelText('Description'), 'Details')
    await userEvent.click(screen.getByRole('button', { name: 'Create Space' }))

    expect(await screen.findByText('Connect wallet to create a space.')).toBeInTheDocument()
    expect(mocks.createSpaceMock).not.toHaveBeenCalled()
  })
})
