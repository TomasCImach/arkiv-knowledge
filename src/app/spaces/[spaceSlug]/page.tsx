import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { PageTreeNav } from '@/app/_components/page-tree-nav'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { SpaceSearchForm } from '@/app/_components/space-search-form'
import { fetchCurrentBlock, getSpaceBySlug, listPagesBySpace, searchPages } from '@/arkiv/queries'
import type { PageParentMode, PageStatus, ParsedPage } from '@/arkiv/types'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

type SpaceRouteProps = {
  params: Promise<{ spaceSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
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
      <section className="stack">
        <div className="card stack">
          <h1 className="title">Space temporarily unavailable</h1>
          <p className="notice">Could not read this space from Arkiv: {message}</p>
          <Link href="/" className="button secondary">
            Back to spaces
          </Link>
        </div>
      </section>
    )
  }

  if (!space) {
    notFound()
  }

  const q = firstValue(query.q)
  const status = firstValue(query.status) as PageStatus | ''
  const parentRaw = firstValue(query.parent)
  const parentMode: PageParentMode =
    parentRaw === 'root' || parentRaw === 'child' ? (parentRaw as PageParentMode) : 'all'
  let currentBlock: bigint | undefined
  let allPages: ParsedPage[] = []
  let pages: ParsedPage[] = []
  let queryError = ''

  try {
    const [block, indexedPages, filteredPages] = await Promise.all([
      fetchCurrentBlock(),
      listPagesBySpace(spaceSlug),
      q || status || parentMode !== 'all'
        ? searchPages({ spaceSlug, q, status: status || undefined, parentMode })
        : Promise.resolve<ParsedPage[] | null>(null)
    ])
    currentBlock = block
    allPages = indexedPages
    pages = filteredPages ?? indexedPages
  } catch (error) {
    queryError = formatReadError(error, 'Failed to query pages.')
  }

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
            <span className="badge">Space key: {space.entityKey.slice(0, 14)}...</span>
            {currentBlock ? (
              <ExtendEntityButton
                entityKey={space.entityKey}
                owner={space.owner}
                expiresAtBlock={space.expiresAtBlock}
                currentBlock={currentBlock}
                kind="space"
              />
            ) : null}
          </div>
          <p className="subtitle">Settings updates are owner-only; reads remain public without wallet.</p>
          {queryError ? <p className="notice">Page query degraded: {queryError}</p> : null}
        </div>

        <SpaceSearchForm initialQ={q} initialStatus={status || undefined} initialParentMode={parentMode} />

        {pages.length === 0 ? (
          <div className="card stack">
            <p className="subtitle">No pages match the current Arkiv query.</p>
          </div>
        ) : (
          <div className="card stack">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Pages</h2>
              <span className="badge">{pages.length} results</span>
            </div>
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
