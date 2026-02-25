import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { SpaceSearchForm } from '@/app/_components/space-search-form'
import { fetchCurrentBlock, getSpaceBySlug, listPagesBySpace, searchPages } from '@/arkiv/queries'
import type { PageStatus, ParsedPage } from '@/arkiv/types'
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
  let currentBlock: bigint | undefined
  let pages: ParsedPage[] = []
  let queryError = ''

  try {
    currentBlock = await fetchCurrentBlock()
    pages = q || status ? await searchPages({ spaceSlug, q, status: status || undefined }) : await listPagesBySpace(spaceSlug)
  } catch (error) {
    queryError = formatReadError(error, 'Failed to query pages.')
  }

  return (
    <section className="stack">
      <RealtimeRefresh spaceKey={space.entityKey} />

      <div className="card stack">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h1 className="title" style={{ fontFamily: 'var(--font-heading)' }}>
            {space.payload.name}
          </h1>
          <span className="badge">{space.visibility}</span>
        </div>
        <p className="subtitle">{space.payload.description}</p>
        <div className="toolbar">
          <Link href={`/spaces/${spaceSlug}/new`} className="button">
            New Page
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
        {queryError ? <p className="notice">Page query degraded: {queryError}</p> : null}
      </div>

      <SpaceSearchForm initialQ={q} initialStatus={status || undefined} />

      {pages.length === 0 ? (
        <div className="card stack">
          <p className="subtitle">No pages match the current Arkiv query.</p>
        </div>
      ) : (
        <div className="grid">
          {pages.map((page) => (
            <Link key={page.entityKey} href={`/spaces/${spaceSlug}/${page.pageSlug}`} className="card stack">
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <strong>{page.payload.title}</strong>
                <span className="badge">{page.status}</span>
              </div>
              <p className="subtitle">{page.payload.summary}</p>
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <span className="badge">slug: {page.pageSlug}</span>
                {page.parentPageKey ? <span className="badge">child</span> : <span className="badge">root</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
