import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { QueryDebugPanel } from '@/app/_components/query-debug-panel'

const ORIGINAL_ARKIV_QUERY_DEBUG = process.env.ARKIV_QUERY_DEBUG
const ORIGINAL_NEXT_PUBLIC_ARKIV_QUERY_DEBUG = process.env.NEXT_PUBLIC_ARKIV_QUERY_DEBUG

describe('query debug panel visibility', () => {
  beforeEach(() => {
    delete process.env.ARKIV_QUERY_DEBUG
    delete process.env.NEXT_PUBLIC_ARKIV_QUERY_DEBUG
  })

  afterEach(() => {
    cleanup()
    process.env.ARKIV_QUERY_DEBUG = ORIGINAL_ARKIV_QUERY_DEBUG
    process.env.NEXT_PUBLIC_ARKIV_QUERY_DEBUG = ORIGINAL_NEXT_PUBLIC_ARKIV_QUERY_DEBUG
  })

  it('stays hidden by default when no debug flag is set', () => {
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.queryByText('Query Debug')).not.toBeInTheDocument()
  })

  it('renders when ARKIV_QUERY_DEBUG is enabled', () => {
    process.env.ARKIV_QUERY_DEBUG = 'true'
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.getByText('Query Debug')).toBeInTheDocument()
    expect(screen.getByText('debug only')).toBeInTheDocument()
  })

  it('renders when NEXT_PUBLIC_ARKIV_QUERY_DEBUG is enabled', () => {
    process.env.NEXT_PUBLIC_ARKIV_QUERY_DEBUG = '1'
    render(<QueryDebugPanel title="Query Debug" summary={{ q: 'arkiv' }} predicates={[]} />)

    expect(screen.getByText('Query Debug')).toBeInTheDocument()
  })
})
