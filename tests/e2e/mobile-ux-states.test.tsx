import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pathname: '/',
  refreshMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    refresh: mocks.refreshMock
  })
}))

import { MobileNavDrawer } from '@/app/_components/mobile-nav-drawer'
import { RetryButton } from '@/app/_components/retry-button'

describe('mobile ux state primitives', () => {
  beforeEach(() => {
    mocks.pathname = '/'
    mocks.refreshMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('opens and closes the mobile navigation drawer', async () => {
    render(
      <MobileNavDrawer>
        <div>Drawer content</div>
      </MobileNavDrawer>
    )

    const drawer = document.getElementById('mobile-nav-drawer')
    expect(drawer).not.toBeNull()
    expect(drawer).toHaveAttribute('aria-hidden', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(drawer).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText('Drawer content')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(drawer).toHaveAttribute('aria-hidden', 'true')
  })

  it('closes the drawer when route pathname changes', async () => {
    const { rerender } = render(
      <MobileNavDrawer>
        <div>Drawer content</div>
      </MobileNavDrawer>
    )

    const drawer = document.getElementById('mobile-nav-drawer')
    expect(drawer).not.toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(drawer).toHaveAttribute('aria-hidden', 'false')

    mocks.pathname = '/spaces/new'
    rerender(
      <MobileNavDrawer>
        <div>Drawer content</div>
      </MobileNavDrawer>
    )

    expect(drawer).toHaveAttribute('aria-hidden', 'true')
  })

  it('retries by calling router.refresh', async () => {
    render(<RetryButton label="Retry query" />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry query' }))
    expect(mocks.refreshMock).toHaveBeenCalledTimes(1)
  })
})
