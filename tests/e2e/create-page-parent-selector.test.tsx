import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  createPageMock: vi.fn(),
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
  createPage: mocks.createPageMock
}))

vi.mock('@/lib/wallet', () => ({
  runWritePreflight: mocks.runWritePreflightMock,
  formatWalletError: mocks.formatWalletErrorMock
}))

import { CreatePageForm } from '@/app/_components/create-page-form'

describe('create page parent selector', () => {
  beforeEach(() => {
    mocks.pushMock.mockReset()
    mocks.refreshMock.mockReset()
    mocks.createPageMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.formatWalletErrorMock.mockReset()

    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.createPageMock.mockResolvedValue({
      pageKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
  })

  it('passes selected parent page key to createPage mutation', async () => {
    render(
      <CreatePageForm
        spaceKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        spaceSlug="space"
        availableParents={[
          {
            entityKey: '0x2222222222222222222222222222222222222222222222222222222222222222',
            owner: '0x1111111111111111111111111111111111111111',
            expiresAtBlock: 1000n,
            spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            spaceSlug: 'space',
            pageSlug: 'parent-page',
            title: 'Parent Page',
            status: 'published',
            updatedAtMs: 10,
            payload: {
              title: 'Parent Page',
              bodyMarkdown: '',
              summary: '',
              createdAt: '2026-02-24T00:00:00.000Z',
              updatedAt: '2026-02-24T00:00:00.000Z'
            }
          }
        ]}
      />
    )

    await userEvent.type(screen.getByLabelText('Title'), 'Child Page')
    await userEvent.type(screen.getByLabelText('Summary'), 'Summary')
    await userEvent.type(screen.getByLabelText('Markdown body'), 'Body text')
    await userEvent.selectOptions(
      screen.getByLabelText('Parent page'),
      '0x2222222222222222222222222222222222222222222222222222222222222222'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Create Page' }))

    expect(mocks.createPageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        parentPageKey: '0x2222222222222222222222222222222222222222222222222222222222222222'
      })
    )
  })
})
