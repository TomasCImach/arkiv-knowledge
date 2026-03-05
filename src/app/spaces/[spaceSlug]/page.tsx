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

function formatVisibilityLabel(visibility: string): string {
  if (visibility === 'private') {
    return 'Private'
  }
  if (visibility === 'unlisted') {
    return 'Unlisted'
  }
  return 'Public'
}

function formatStatusLabel(status: string): string {
  if (status.length === 0) {
    return status
  }
  return `${status[0].toUpperCase()}${status.slice(1)}`
}

function formatUpdatedLabel(updatedAtMs: number): string {
  const diffMs = Date.now() - updatedAtMs
  const diffHours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)))
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
  const diffDays = Math.max(1, Math.floor(diffHours / 24))
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
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
    <section className="space-workspace">
      <RealtimeRefresh spaceKey={space.entityKey} />

      <main className="space-workspace-main">
        <header className="space-workspace-header">
          <div className="toolbar">
            <h2 className="section-title">{space.payload.name}</h2>
            <span className="badge">{formatVisibilityLabel(space.visibility)}</span>
          </div>
          <div className="toolbar">
            <Link href={`/spaces/${spaceSlug}/settings`} className="button secondary">
              <span className="material-symbols-outlined" aria-hidden>
                settings
              </span>
              Space Settings
            </Link>
            <Link href={`/spaces/${spaceSlug}/new`} className="button">
              <span className="material-symbols-outlined" aria-hidden>
                add_circle
              </span>
              New Page
            </Link>
            <span className="space-workspace-avatar" aria-hidden>
              AR
            </span>
          </div>
        </header>

        <div className="space-workspace-scroll">
          <div className="space-workspace-content stack">
            <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: space.payload.name }]} />

            <p className="space-intro-copy">
              {space.payload.description || 'Internal and external documentation for this space is shown below.'}
            </p>

            <SpaceSearchForm
              initialQ={q}
              initialStatus={status || undefined}
              initialParentMode={parentMode}
              initialOwner={ownerRaw}
              initialSort={sort}
              resultCount={pages.length}
            />

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
              <p className="subtitle">
                Browse without a wallet. To create pages or change settings, switch to the owner wallet.
              </p>
            </TechnicalDetails>

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
              <div className="space-pages-list">
                <h3 className="space-pages-title">Pages</h3>
                <p className="subtitle">
                  {hasActiveQuery
                    ? `Showing ${pages.length} page${pages.length === 1 ? '' : 's'} in ${space.payload.name} for the active filters.`
                    : `Showing all ${pages.length} page${pages.length === 1 ? '' : 's'} in ${space.payload.name}.`}
                </p>
                <div className="space-pages-stack">
                  {pages.map((page) => (
                    <Link key={page.entityKey} href={`/spaces/${spaceSlug}/${page.pageSlug}`} className="space-page-item">
                      <div className="space-page-item-top">
                        <div className="toolbar">
                          <span className="material-symbols-outlined space-page-icon" aria-hidden>
                            {page.parentPageKey ? 'description' : 'menu_book'}
                          </span>
                          <h4 className="space-page-title">{page.payload.title}</h4>
                        </div>
                        <div className="toolbar">
                          <span className={`space-pill status-${page.status}`}>{formatStatusLabel(page.status)}</span>
                          <span className={`space-pill tone-${page.parentPageKey ? 'child' : 'root'}`}>
                            {page.parentPageKey ? 'Child' : 'Root'}
                          </span>
                        </div>
                      </div>
                      <p className="subtitle">{page.payload.summary}</p>
                      <div className="space-page-meta">
                        <code>{`/${spaceSlug}/${page.pageSlug}`}</code>
                        <span>
                          <span className="material-symbols-outlined" aria-hidden>
                            schedule
                          </span>
                          Updated {formatUpdatedLabel(page.updatedAtMs)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-workspace-right">
            <div className="space-right-panel">
              <h3>Space Contents</h3>
              <PageTreeNav spaceSlug={spaceSlug} pages={allPages} />
            </div>
            <div className="space-right-panel space-integrations-panel">
              <h4>Integrations</h4>
              <p>Sync this space automatically with your GitHub repository.</p>
              <Link href="/migrate/gitbook" className="button secondary">
                Configure Sync
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </section>
  )
}
