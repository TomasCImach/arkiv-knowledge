import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { OwnerEditPageCta } from '@/app/_components/owner-edit-page-cta'
import { PageTreeNav } from '@/app/_components/page-tree-nav'
import { PageMarkdown } from '@/app/_components/page-markdown'
import { PresencePanel } from '@/app/_components/presence-panel'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { TechnicalDetails } from '@/app/_components/technical-details'
import {
  getPageBySlugInSpace,
  getSpaceBySlug,
  listBacklinks,
  listPagesBySpaceKey,
  listPresenceForPage,
  listRevisionsByPage
} from '@/arkiv/queries'
import type { ParsedPage } from '@/arkiv/types'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { buildAncestorChain } from '@/features/hierarchy/tree'
import { equalAddress } from '@/features/ownership/permissions'
import { canViewSpace } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function PageRoute({
  params,
  searchParams: _
}: {
  params: Promise<{ spaceSlug: string; pageSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { spaceSlug, pageSlug } = await params

  let space
  let page
  let spacePages: ParsedPage[] = []
  try {
    space = await getSpaceBySlug(spaceSlug)
    if (!space) {
      notFound()
    }

    ;[page, spacePages] = await Promise.all([
      getPageBySlugInSpace(space.entityKey, pageSlug),
      listPagesBySpaceKey(space.entityKey)
    ])
  } catch (error) {
    const message = formatReadError(error)
    return (
      <section className="stack doc-column">
        <RouteStateCard
          tone="error"
          title="Page temporarily unavailable"
          message={`Could not load page data from Arkiv: ${message}`}
          action={
            <>
              <RetryButton label="Retry page read" />
              <RouteStateLinkAction href={`/spaces/${spaceSlug}`} label="Back to space" secondary />
            </>
          }
        />
      </section>
    )
  }

  if (!space || !page) {
    notFound()
  }
  const viewer = await getAuthenticatedViewerAddress()
  if (!canViewSpace(space, viewer)) {
    notFound()
  }

  const [revisionsResult, backlinksResult, presenceResult] = await Promise.allSettled([
    listRevisionsByPage(page.entityKey),
    listBacklinks(page.entityKey),
    listPresenceForPage(page.entityKey)
  ])

  const revisions = revisionsResult.status === 'fulfilled' ? revisionsResult.value : []
  const backlinks = backlinksResult.status === 'fulfilled' ? backlinksResult.value : []
  const activePresence = presenceResult.status === 'fulfilled' ? presenceResult.value : []

  const queryErrors = [
    revisionsResult.status === 'rejected' ? revisionsResult.reason : null,
    backlinksResult.status === 'rejected' ? backlinksResult.reason : null,
    presenceResult.status === 'rejected' ? presenceResult.reason : null
  ]
    .filter(Boolean)
    .map((reason) => formatReadError(reason))
  const ancestors = buildAncestorChain(spacePages, page)
  const isVerifiedOwnerSession = equalAddress(page.owner, viewer)

  return (
    <section className="content-view-layout">
      <RealtimeRefresh spaceKey={space.entityKey} pageKey={page.entityKey} />

      <aside className="card stack doc-aside content-left-aside">
        <div className="toolbar dashboard-section-head">
          <strong>{space.payload.name}</strong>
          <Link href={`/spaces/${spaceSlug}/new`} className="badge">
            New Page
          </Link>
        </div>
        <PageTreeNav spaceSlug={spaceSlug} pages={spacePages} activePageSlug={pageSlug} />
      </aside>

      <div className="stack doc-column content-main-column">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Knowledge Base' },
            { href: `/spaces/${spaceSlug}`, label: space.payload.name },
            ...ancestors.map((ancestor) => ({
              href: `/spaces/${spaceSlug}/${ancestor.pageSlug}`,
              label: ancestor.payload.title
            })),
            { label: page.payload.title }
          ]}
        />

        <article className="card stack page-hero-card">
          <div className="toolbar dashboard-section-head">
            <h1 className="title">{page.payload.title}</h1>
            <span className="badge">{page.status}</span>
          </div>

          <p className="subtitle">{page.payload.summary}</p>
          <div className="toolbar page-meta-bar">
            <span className="badge">space: {space.spaceSlug}</span>
            <span className="badge">slug: {page.pageSlug}</span>
            <span className="badge">{page.parentPageKey ? 'child page' : 'root page'}</span>
          </div>

          <OwnerEditPageCta
            href={`/spaces/${spaceSlug}/${pageSlug}/edit`}
            owner={page.owner}
            isVerifiedOwnerSession={isVerifiedOwnerSession}
          />
          <p className="subtitle">Reading is open for everyone.</p>
          <TechnicalDetails summary="Technical details (page entity)">
            <span className="badge">Canonical key: {page.entityKey}</span>
          </TechnicalDetails>
        </article>

        {queryErrors.length > 0 ? (
          <RouteStateCard
            tone="error"
            title="Some live panels are degraded"
            message="Arkiv relationship, revision, or presence reads are temporarily unavailable."
            action={<RetryButton label="Retry live panels" />}
          />
        ) : null}

        <section id="article-content">
          <PageMarkdown markdown={page.payload.bodyMarkdown} />
        </section>

        <section id="backlinks" className="card stack">
          <h3 className="section-title">Backlinks</h3>
          <TechnicalDetails summary="Technical details (link index)">
            <p className="subtitle">Backlinks are derived from `kb.link` relationship entities.</p>
          </TechnicalDetails>
          {backlinks.length === 0 ? (
            <p className="subtitle">No backlinks currently indexed.</p>
          ) : (
            backlinks.map((link) => (
              <Link key={link.entityKey} href={`/spaces/${spaceSlug}/${link.payload.sourceSlug}`} className="doc-list-item">
                <div className="toolbar doc-list-head">
                  <strong>{link.payload.sourceSlug}</strong>
                  <span className="badge">backlink</span>
                </div>
                <span className="subtitle">edge {link.entityKey.slice(0, 10)}...</span>
              </Link>
            ))
          )}
        </section>

        <section id="revision-log" className="card stack">
          <h3 className="section-title">Revision Log</h3>
          {revisions.length === 0 ? (
            <p className="subtitle">No revisions found.</p>
          ) : (
            revisions
              .slice()
              .reverse()
              .map((revision) => (
                <div key={revision.entityKey} className="doc-list-item">
                  <div className="toolbar doc-list-head">
                    <strong>Revision #{revision.revisionNo}</strong>
                    <span className="badge">editor {revision.editor.slice(0, 10)}...</span>
                  </div>
                  <p className="subtitle">{revision.payload.editSummary}</p>
                </div>
              ))
          )}
        </section>

        <section id="live-presence">
          <PresencePanel spaceKey={space.entityKey} pageKey={page.entityKey} records={activePresence} />
        </section>
      </div>

      <aside className="card stack page-outline-aside">
        <h4 style={{ margin: 0 }}>On this page</h4>
        <nav className="page-outline-nav">
          <a href="#article-content">Page content</a>
          <a href="#backlinks">Backlinks</a>
          <a href="#revision-log">Revision log</a>
          <a href="#live-presence">Live presence</a>
        </nav>
        <div className="notice">
          <strong>Need help?</strong>
          <p className="subtitle">Owner wallet signatures are required for edit, lifecycle, and ownership updates.</p>
        </div>
      </aside>
    </section>
  )
}
