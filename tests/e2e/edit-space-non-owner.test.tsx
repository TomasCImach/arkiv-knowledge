import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  updateSpaceMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
    address: '0x2222222222222222222222222222222222222222',
    chainId: 60138453025
  }),
  useSignMessage: () => ({
    signMessageAsync: vi.fn()
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => ({})
}))

vi.mock('@/arkiv/mutations/spaces', () => ({
  updateSpace: mocks.updateSpaceMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: vi.fn(),
  formatWalletError: vi.fn()
}))

import { EditSpaceForm } from '@/app/_components/edit-space-form'

describe('edit space non-owner guardrails', () => {
  beforeEach(() => {
    mocks.updateSpaceMock.mockReset()
  })

  it('renders explicit owner-only notice and blocks mutation', async () => {
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

    expect(screen.getByText('Switch to the owner wallet to continue.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled()
    expect(mocks.updateSpaceMock).not.toHaveBeenCalled()
  })
})
