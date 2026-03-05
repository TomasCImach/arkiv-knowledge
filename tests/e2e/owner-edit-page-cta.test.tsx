import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  accountState: {
    isConnected: false,
    address: undefined as `0x${string}` | undefined
  }
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: mocks.accountState.isConnected,
    address: mocks.accountState.address
  })
}))

import { OwnerEditPageCta } from '@/app/_components/owner-edit-page-cta'

describe('owner edit page CTA', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mocks.accountState.isConnected = false
    mocks.accountState.address = undefined
  })

  it('keeps edit button disabled when wallet is disconnected', () => {
    render(
      <OwnerEditPageCta
        href="/spaces/arkiv-demo/page/edit"
        owner="0x1111111111111111111111111111111111111111"
        isVerifiedOwnerSession={false}
      />
    )

    expect(screen.queryByRole('button', { name: 'Edit Page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit Page' })).not.toBeInTheDocument()
    expect(screen.getByText('Connect the owner wallet to edit this page.')).toBeInTheDocument()
  })

  it('enables edit link only for connected + verified owner', () => {
    mocks.accountState.isConnected = true
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'

    const { rerender } = render(
      <OwnerEditPageCta
        href="/spaces/arkiv-demo/page/edit"
        owner="0x1111111111111111111111111111111111111111"
        isVerifiedOwnerSession={false}
      />
    )

    expect(screen.queryByRole('button', { name: 'Edit Page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit Page' })).not.toBeInTheDocument()
    expect(screen.getByText('Verify Private Access to enable owner edit actions.')).toBeInTheDocument()

    rerender(
      <OwnerEditPageCta
        href="/spaces/arkiv-demo/page/edit"
        owner="0x1111111111111111111111111111111111111111"
        isVerifiedOwnerSession
      />
    )

    expect(screen.getByRole('link', { name: 'Edit Page' })).toHaveAttribute('href', '/spaces/arkiv-demo/page/edit')
  })
})
