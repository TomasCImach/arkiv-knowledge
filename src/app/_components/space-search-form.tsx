'use client'

import { FormEvent, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import type { PageParentMode, PageSortMode } from '@/arkiv/types'

export function SpaceSearchForm({
  initialQ,
  initialStatus,
  initialParentMode = 'all',
  initialOwner = '',
  initialSort = 'updated_desc'
}: {
  initialQ: string
  initialStatus?: string
  initialParentMode?: PageParentMode
  initialOwner?: string
  initialSort?: PageSortMode
}) {
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus ?? '')
  const [parentMode, setParentMode] = useState<PageParentMode>(initialParentMode)
  const [owner, setOwner] = useState(initialOwner)
  const [sort, setSort] = useState<PageSortMode>(initialSort)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams(current.toString())
    params.delete('viewer')
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }

    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }

    if (parentMode === 'all') {
      params.delete('parent')
    } else {
      params.set('parent', parentMode)
    }

    if (owner.trim()) {
      params.set('owner', owner.trim())
    } else {
      params.delete('owner')
    }

    if (sort === 'updated_desc') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(nextUrl)
  }

  return (
    <form className="card toolbar search-strip" onSubmit={onSubmit}>
      <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by indexed tokens" />
      <select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">Any status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
      <select value={parentMode} onChange={(event) => setParentMode(event.target.value as PageParentMode)}>
        <option value="all">All pages</option>
        <option value="root">Root only</option>
        <option value="child">Has parent</option>
      </select>
      <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Owner 0x..." />
      <button
        type="button"
        className="secondary"
        onClick={() => {
          if (address) {
            setOwner(address)
          }
        }}
        disabled={!isConnected || !address}
      >
        Owned by me
      </button>
      <button
        type="button"
        className="secondary"
        onClick={() => {
          setOwner('')
        }}
      >
        Any owner
      </button>
      <select value={sort} onChange={(event) => setSort(event.target.value as PageSortMode)}>
        <option value="updated_desc">Updated (newest)</option>
        <option value="updated_asc">Updated (oldest)</option>
        <option value="title_asc">Title (A-Z)</option>
      </select>
      <button type="submit">Apply query</button>
    </form>
  )
}
