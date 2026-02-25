import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock
  }),
  usePathname: () => '/spaces/alpha',
  useSearchParams: () => ({
    toString: () => ''
  })
}))

import { SpaceSearchForm } from '@/app/_components/space-search-form'

describe('space search form filters', () => {
  beforeEach(() => {
    mocks.pushMock.mockReset()
  })

  it('serializes q/status/parent/owner/sort into URL params', async () => {
    render(<SpaceSearchForm initialQ="" initialParentMode="all" initialSort="updated_desc" />)

    await userEvent.type(screen.getByPlaceholderText('Search by indexed tokens'), 'arkiv')
    await userEvent.selectOptions(screen.getByDisplayValue('Any status'), 'published')
    await userEvent.selectOptions(screen.getByDisplayValue('All pages'), 'child')
    await userEvent.type(screen.getByPlaceholderText('Owner 0x...'), '0x1111111111111111111111111111111111111111')
    await userEvent.selectOptions(screen.getByDisplayValue('Updated (newest)'), 'title_asc')
    await userEvent.click(screen.getByRole('button', { name: 'Apply query' }))

    expect(mocks.pushMock).toHaveBeenCalledWith(
      '/spaces/alpha?q=arkiv&status=published&parent=child&owner=0x1111111111111111111111111111111111111111&sort=title_asc'
    )
  })
})
