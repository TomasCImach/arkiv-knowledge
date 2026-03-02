import Link from 'next/link'
import type { Hex } from 'viem'
import { isAddress } from 'viem'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { QueryDebugPanel } from '@/app/_components/query-debug-panel'
import { SpaceSearchForm } from '@/app/_components/space-search-form'
import { buildGlobalPageSearchPredicates, listSpaces, searchPagesGlobal } from '@/arkiv/queries'
import type { GlobalPageSearchInput, PageParentMode, PageSortMode, PageStatus, ParsedPage } from '@/arkiv/types'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { filterPagesByVisibleSpaces, firstQueryValue } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function GlobalPageSearchRoute({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const q = firstQueryValue(query.q)
  const status = firstQueryValue(query.status) as PageStatus | ''
  const parentRaw = firstQueryValue(query.parent)
  const parentMode: PageParentMode =
    parentRaw === 'root' || parentRaw === 'child' ? (parentRaw as PageParentMode) : 'all'
  const ownerRaw = firstQueryValue(query.owner).trim()
  const owner = ownerRaw.length > 0 && isAddress(ownerRaw) ? (ownerRaw as Hex) : undefined
  const sortRaw = firstQueryValue(query.sort)
  const sort: PageSortMode =
    sortRaw === 'updated_asc' || sortRaw === 'title_asc' ? (sortRaw as PageSortMode) : 'updated_desc'
  const viewer = await getAuthenticatedViewerAddress()

  const input: GlobalPageSearchInput = {
    q,
    status: status || undefined,
    parentMode,
    owner,
    sort
  }

  const activePredicates = buildGlobalPageSearchPredicates(input)
  const hasActiveQuery = q.length > 0 || Boolean(status) || parentMode !== 'all' || Boolean(owner)
  let pages: ParsedPage[] = []
  let queryError = ''

  if (hasActiveQuery) {
    try {
      const [rawPages, spaces] = await Promise.all([searchPagesGlobal(input), listSpaces(300)])
      pages = filterPagesByVisibleSpaces(rawPages, spaces, viewer)
    } catch (error) {
      queryError = formatReadError(error, 'Failed to query pages across spaces.')
    }
  }

  if (ownerRaw.length > 0 && !owner) {
    queryError = queryError ? `${queryError} Invalid owner filter ignored.` : 'Invalid owner filter ignored.'
  }

  return (
    <section className="stack doc-column">
      <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: 'Search Pages' }]} />

      <div className="card stack">
        <h1 className="title">Cross-Space Page Search</h1>
        <p className="subtitle">Search pages across spaces. Browsing stays public.</p>
      </div>

      <SpaceSearchForm
        initialQ={q}
        initialStatus={status || undefined}
        initialParentMode={parentMode}
        initialOwner={ownerRaw}
        initialSort={sort}
      />

      <QueryDebugPanel
        title="Global Query Debug"
        summary={{
          q: q || '(empty)',
          status: status || '(any)',
          parentMode,
          owner: owner ?? '(any)',
          viewer: viewer ?? '(public)',
          sort
        }}
        predicates={activePredicates}
      />

      {!hasActiveQuery ? (
        <div className="card stack">
          <p className="subtitle">Add at least one filter (query, status, owner, or parent mode) to run cross-space search.</p>
        </div>
      ) : null}

      {queryError ? (
        <div className="card stack">
          <p className="notice">{queryError}</p>
        </div>
      ) : null}

      {hasActiveQuery && !queryError ? (
        pages.length === 0 ? (
          <div className="card stack">
            <p className="subtitle">Showing 0 pages across all visible spaces for the active filters.</p>
            <p className="subtitle">No pages match the current query.</p>
          </div>
        ) : (
          <div className="card stack">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Results</h2>
              <span className="badge">{pages.length} pages</span>
            </div>
            <p className="subtitle">
              Showing {pages.length} page{pages.length === 1 ? '' : 's'} across all visible spaces for the active filters.
            </p>
            {pages.map((page) => (
              <Link key={page.entityKey} href={`/spaces/${page.spaceSlug}/${page.pageSlug}`} className="doc-list-item">
                <div className="toolbar doc-list-head">
                  <strong>{page.payload.title}</strong>
                  <span className="badge">{page.status}</span>
                </div>
                <p className="subtitle">{page.payload.summary}</p>
                <div className="toolbar doc-list-meta">
                  <span className="badge">space: {page.spaceSlug}</span>
                  <span className="badge">{page.parentPageKey ? 'child' : 'root'}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : null}
    </section>
  )
}
