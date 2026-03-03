import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createPageMock: vi.fn(),
  runWritePreflightMock: vi.fn()
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
  formatWalletError: vi.fn((_error, fallback: string) => fallback)
}))

import { CreatePageForm } from '@/app/_components/create-page-form'

describe('page authoring ux', () => {
  beforeEach(() => {
    mocks.createPageMock.mockReset()
    mocks.runWritePreflightMock.mockReset()
    mocks.runWritePreflightMock.mockResolvedValue({ ok: true })
    mocks.createPageMock.mockResolvedValue({
      pageKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('supports markdown edit and preview tabs', async () => {
    render(
      <CreatePageForm
        spaceKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        spaceSlug="space"
        spaceOwner="0x1111111111111111111111111111111111111111"
        availableParents={[]}
      />
    )

    await userEvent.type(screen.getByLabelText('Markdown body'), '# Heading')
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument()
  })

  it('warns before leaving when form has unsaved changes', async () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(
      <CreatePageForm
        spaceKey="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        spaceSlug="space"
        spaceOwner="0x1111111111111111111111111111111111111111"
        availableParents={[]}
      />
    )

    await userEvent.type(screen.getByLabelText('Title'), 'Unsaved Draft')
    const link = document.createElement('a')
    link.href = '/spaces/another'
    link.textContent = 'Go elsewhere'
    document.body.appendChild(link)

    await userEvent.click(link)

    expect(confirmMock).toHaveBeenCalledWith('You have unsaved changes. Leave without saving?')
    confirmMock.mockRestore()
  })
})
