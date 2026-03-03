import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Hex } from 'viem'
import { isAddress } from 'viem'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { PageTreeNav } from '@/app/_components/page-tree-nav'
import { QueryDebugPanel } from '@/app/_components/query-debug-panel'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { SpaceSearchForm } from '@/app/_components/space-search-form'
import { TechnicalDetails } from '@/app/_components/technical-details'
import { buildPageSearchPredicates, fetchCurrentBlock, getSpaceBySlug, listPagesBySpaceKey, searchPages } from '@/arkiv/queries'
import type { PageParentMode, PageSortMode, PageStatus, ParsedPage } from '@/arkiv/types'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { canViewSpace, firstQueryValue } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export type SpaceRouteProps = {
  params: Promise<{ spaceSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SpacePage({ params, searchParams }: SpaceRouteProps) {
  const { spaceSlug } = await params
  const query = await searchParams

  let space
  try {
    space = await getSpaceBySlug(spaceSlug)
  } catch (error) {
    const message = formatReadError(error)
    return (
      <section className="stack doc-column">
        <RouteStateCard
          tone="error"
          title="Space temporarily unavailable"
          message={`Could not read this space from Arkiv: ${message}`}
          action={
            <>
              <RetryButton label="Retry space read" />
              <RouteStateLinkAction href="/" label="Back to spaces" secondary />
            </>
          }
        />
      </section>
    )
  }

  if (!space) {
    notFound()
  }
  const viewer = await getAuthenticatedViewerAddress()
  if (!canViewSpace(space, viewer)) {
    notFound()
  }

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
  let currentBlock: bigint | undefined
  let allPages: ParsedPage[] = []
  let pages: ParsedPage[] = []
  let queryError = ''
  const hasActiveQuery = q.length > 0 || Boolean(status) || parentMode !== 'all' || Boolean(owner) || sort !== 'updated_desc'

  try {
    const [block, indexedPages, filteredPages] = await Promise.all([
      fetchCurrentBlock(),
      listPagesBySpaceKey(space.entityKey),
      hasActiveQuery
        ? searchPages({
            spaceKey: space.entityKey,
            spaceSlug,
            q,
            status: status || undefined,
            parentMode,
            owner,
            sort
          })
        : Promise.resolve<ParsedPage[] | null>(null)
    ])
    currentBlock = block
    allPages = indexedPages
    pages = filteredPages ?? indexedPages
  } catch (error) {
    queryError = formatReadError(error, 'Failed to query pages.')
  }

  if (ownerRaw.length > 0 && !owner) {
    queryError = queryError ? `${queryError} Invalid owner filter ignored.` : 'Invalid owner filter ignored.'
  }

  const activePredicates = buildPageSearchPredicates({
    spaceKey: space.entityKey,
    spaceSlug,
    q,
    status: status || undefined,
    parentMode,
    owner,
    sort
  })

  return (
    <section className="doc-layout">
      <RealtimeRefresh spaceKey={space.entityKey} />

      <aside className="card stack doc-aside">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <strong>Space Contents</strong>
          <span className="badge">{allPages.length} pages</span>
        </div>
        <PageTreeNav spaceSlug={spaceSlug} pages={allPages} />
      </aside>

      <div className="stack doc-column">
        <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: space.payload.name }]} />

        <div className="card stack">
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <h1 className="title">{space.payload.name}</h1>
            <span className="badge">{space.visibility}</span>
          </div>
          <p className="subtitle">{space.payload.description}</p>
          <div className="toolbar">
            <Link href={`/spaces/${spaceSlug}/new`} className="button">
              New Page
            </Link>
            <Link href={`/spaces/${spaceSlug}/settings`} className="button secondary">
              Space Settings
            </Link>
          </div>
          <p className="subtitle">Browse without a wallet. To create pages or change settings, switch to the owner wallet.</p>
          <TechnicalDetails summary="Technical details (space entity)">
            <span className="badge">Space key: {space.entityKey}</span>
            {currentBlock ? (
              <ExtendEntityButton
                entityKey={space.entityKey}
                owner={space.owner}
                expiresAtBlock={space.expiresAtBlock}
                currentBlock={currentBlock}
                kind="space"
              />
            ) : null}
            <p className="subtitle">Retention controls and lifecycle metadata are shown here to keep browsing focused on content.</p>
          </TechnicalDetails>
        </div>

        <SpaceSearchForm
          initialQ={q}
          initialStatus={status || undefined}
          initialParentMode={parentMode}
          initialOwner={ownerRaw}
          initialSort={sort}
        />

        <QueryDebugPanel
          title="Space Query Debug"
          summary={{
            spaceKey: space.entityKey,
            spaceSlug,
            q: q || '(empty)',
            status: status || '(any)',
            parentMode,
            owner: owner ?? '(any)',
            sort
          }}
          predicates={activePredicates}
        />

        {queryError ? (
          <RouteStateCard
            tone="error"
            title="Page query degraded"
            message={queryError}
            action={<RetryButton label="Retry page query" />}
          />
        ) : pages.length === 0 ? (
          <RouteStateCard
            title="No pages in this view"
            message={
              hasActiveQuery
                ? `Showing 0 pages in ${space.payload.name} for the active filters.`
                : `Showing 0 pages in ${space.payload.name}.`
            }
            action={<RouteStateLinkAction href={`/spaces/${spaceSlug}/new`} label="Create first page" />}
          />
        ) : (
          <div className="card stack">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Pages</h2>
              <span className="badge">{pages.length} results</span>
            </div>
            <p className="subtitle">
              {hasActiveQuery
                ? `Showing ${pages.length} page${pages.length === 1 ? '' : 's'} in ${space.payload.name} for the active filters.`
                : `Showing all ${pages.length} page${pages.length === 1 ? '' : 's'} in ${space.payload.name}.`}
            </p>
            {pages.map((page) => (
              <Link key={page.entityKey} href={`/spaces/${spaceSlug}/${page.pageSlug}`} className="doc-list-item">
                <div className="toolbar doc-list-head">
                  <strong>{page.payload.title}</strong>
                  <span className="badge">{page.status}</span>
                </div>
                <p className="subtitle">{page.payload.summary}</p>
                <div className="toolbar doc-list-meta">
                  <span className="badge">slug: {page.pageSlug}</span>
                  {page.parentPageKey ? <span className="badge">child</span> : <span className="badge">root</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
