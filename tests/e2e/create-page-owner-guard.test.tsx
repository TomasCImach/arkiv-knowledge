import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createPageMock: vi.fn()
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
  })
}))

vi.mock('@/arkiv/useArkivWallet', () => ({
  useArkivWalletClient: () => ({})
}))

vi.mock('@/arkiv/mutations/pages', () => ({
  createPage: mocks.createPageMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: vi.fn(),
  formatWalletError: vi.fn()
}))

import { CreatePageForm } from '@/app/_components/create-page-form'

describe('create page owner guard', () => {
  beforeEach(() => {
    mocks.createPageMock.mockReset()
  })

  it('blocks non-owner from creating pages in a space', async () => {
    render(
      <CreatePageForm
        spaceKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        spaceSlug="space"
        spaceOwner="0x1111111111111111111111111111111111111111"
        availableParents={[]}
      />
    )

    expect(screen.getByText('Only owner can create pages in this space.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Page' })).toBeDisabled()
    expect(mocks.createPageMock).not.toHaveBeenCalled()
  })
})
