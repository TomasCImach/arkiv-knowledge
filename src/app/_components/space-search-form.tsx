'use client'

import { FormEvent, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PageParentMode } from '@/arkiv/types'

export function SpaceSearchForm({
  initialQ,
  initialStatus,
  initialParentMode = 'all'
}: {
  initialQ: string
  initialStatus?: string
  initialParentMode?: PageParentMode
}) {
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus ?? '')
  const [parentMode, setParentMode] = useState<PageParentMode>(initialParentMode)
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams(current.toString())
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
      <button type="submit">Apply query</button>
    </form>
  )
}
