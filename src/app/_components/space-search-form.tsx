'use client'

import { FormEvent, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import type { PageParentMode, PageSortMode } from '@/arkiv/types'

type SearchFormValues = {
  q: string
  status: string
  parentMode: PageParentMode
  owner: string
  sort: PageSortMode
}

const DEFAULT_VALUES: SearchFormValues = {
  q: '',
  status: '',
  parentMode: 'all',
  owner: '',
  sort: 'updated_desc'
}

function sortLabel(sort: PageSortMode): string {
  switch (sort) {
    case 'updated_asc':
      return 'Updated (oldest)'
    case 'title_asc':
      return 'Title (A-Z)'
    default:
      return 'Updated (newest)'
  }
}

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
  const [advancedOpen, setAdvancedOpen] = useState(
    initialParentMode !== 'all' || initialOwner.trim().length > 0 || initialSort !== 'updated_desc'
  )
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()

  function pushWithValues(values: SearchFormValues) {
    const params = new URLSearchParams(current.toString())
    params.delete('viewer')

    const qValue = values.q.trim()
    if (qValue) {
      params.set('q', qValue)
    } else {
      params.delete('q')
    }

    if (values.status) {
      params.set('status', values.status)
    } else {
      params.delete('status')
    }

    if (values.parentMode === 'all') {
      params.delete('parent')
    } else {
      params.set('parent', values.parentMode)
    }

    const ownerValue = values.owner.trim()
    if (ownerValue) {
      params.set('owner', ownerValue)
    } else {
      params.delete('owner')
    }

    if (values.sort === 'updated_desc') {
      params.delete('sort')
    } else {
      params.set('sort', values.sort)
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(nextUrl)
  }

  function syncState(values: SearchFormValues) {
    setQ(values.q)
    setStatus(values.status)
    setParentMode(values.parentMode)
    setOwner(values.owner)
    setSort(values.sort)
  }

  function updateFilter<K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) {
    const nextValues: SearchFormValues = {
      q,
      status,
      parentMode,
      owner,
      sort,
      [key]: value
    }
    syncState(nextValues)
    pushWithValues(nextValues)
  }

  function clearAllFilters() {
    const resetValues: SearchFormValues = { ...DEFAULT_VALUES }
    syncState(resetValues)
    pushWithValues(resetValues)
    setAdvancedOpen(false)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    pushWithValues({ q, status, parentMode, owner, sort })
  }

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = []
  if (q.trim()) {
    activeChips.push({
      key: 'q',
      label: `Query: ${q.trim()}`,
      clear: () => updateFilter('q', '')
    })
  }
  if (status) {
    activeChips.push({
      key: 'status',
      label: `Status: ${status}`,
      clear: () => updateFilter('status', '')
    })
  }
  if (parentMode !== 'all') {
    activeChips.push({
      key: 'parent',
      label: parentMode === 'root' ? 'Parent: root only' : 'Parent: has parent',
      clear: () => updateFilter('parentMode', 'all')
    })
  }
  if (owner.trim()) {
    activeChips.push({
      key: 'owner',
      label: `Owner: ${owner.trim()}`,
      clear: () => updateFilter('owner', '')
    })
  }
  if (sort !== 'updated_desc') {
    activeChips.push({
      key: 'sort',
      label: `Sort: ${sortLabel(sort)}`,
      clear: () => updateFilter('sort', 'updated_desc')
    })
  }

  return (
    <form className="card stack search-form" onSubmit={onSubmit}>
      <div className="search-basic">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by indexed tokens" />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button type="button" className="secondary" onClick={() => setAdvancedOpen((value) => !value)}>
          {advancedOpen ? 'Hide advanced filters' : 'Show advanced filters'}
        </button>
        <button type="submit" className="search-submit mobile-action-bar">
          Apply query
        </button>
      </div>

      {advancedOpen ? (
        <div className="search-advanced">
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
        </div>
      ) : null}

      {activeChips.length > 0 ? (
        <div className="toolbar search-active-filters">
          {activeChips.map((chip) => (
            <button key={chip.key} type="button" className="badge filter-chip" onClick={chip.clear}>
              {chip.label} ✕
            </button>
          ))}
          <button type="button" className="secondary" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      ) : null}
    </form>
  )
}
