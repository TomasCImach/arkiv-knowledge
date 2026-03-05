import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { QueryDebugPanel } from '@/app/_components/query-debug-panel'

const ORIGINAL_ARKIV_SHOW_TECHNICAL_DETAILS_UI = process.env.ARKIV_SHOW_TECHNICAL_DETAILS_UI
const ORIGINAL_NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI = process.env.NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI

describe('query debug panel visibility', () => {
  beforeEach(() => {
    delete process.env.ARKIV_SHOW_TECHNICAL_DETAILS_UI
    delete process.env.NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI
  })

  afterEach(() => {
    cleanup()
    process.env.ARKIV_SHOW_TECHNICAL_DETAILS_UI = ORIGINAL_ARKIV_SHOW_TECHNICAL_DETAILS_UI
    process.env.NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI = ORIGINAL_NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI
  })

  it('stays hidden by default when no debug flag is set', () => {
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.queryByText('Query Debug')).not.toBeInTheDocument()
  })

  it('renders when ARKIV_SHOW_TECHNICAL_DETAILS_UI is enabled', () => {
    process.env.ARKIV_SHOW_TECHNICAL_DETAILS_UI = 'true'
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.getByText('Query Debug')).toBeInTheDocument()
    expect(screen.getByText('debug only')).toBeInTheDocument()
  })

  it('renders when NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI is enabled', () => {
    process.env.NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI = '1'
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.getByText('Query Debug')).toBeInTheDocument()
  })
})
