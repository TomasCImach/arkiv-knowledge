import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  editPageMock: vi.fn()
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
  editPage: mocks.editPageMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: vi.fn(),
  formatWalletError: vi.fn()
}))

import { EditPageForm } from '@/app/_components/edit-page-form'

describe('edit page owner guard', () => {
  beforeEach(() => {
    mocks.editPageMock.mockReset()
  })

  it('blocks non-owner from editing canonical page', async () => {
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
          pageSlug: 'page',
          title: 'Page',
          status: 'published',
          updatedAtMs: 100,
          payload: {
            title: 'Page',
            bodyMarkdown: 'Body',
            summary: 'Summary',
            createdAt: '2026-02-24T00:00:00.000Z',
            updatedAt: '2026-02-24T00:00:00.000Z'
          }
        }}
        availableParents={[]}
      />
    )

    expect(screen.getByText('Only owner can update this page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Page' })).toBeDisabled()
    expect(mocks.editPageMock).not.toHaveBeenCalled()
  })
})
