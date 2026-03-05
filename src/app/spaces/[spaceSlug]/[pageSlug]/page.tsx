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
import { SpaceOwnerActions } from '@/app/_components/space-owner-actions'
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
    <section className="space-workspace page-workspace">
      <RealtimeRefresh spaceKey={space.entityKey} pageKey={page.entityKey} />

      <main className="space-workspace-main">
        <header className="space-workspace-header">
          <div className="toolbar">
            <h2 className="section-title">{space.payload.name}</h2>
            <span className="badge">{page.parentPageKey ? 'Child Page' : 'Root Page'}</span>
          </div>
          <SpaceOwnerActions spaceSlug={spaceSlug} owner={space.owner} />
        </header>

        <div className="space-workspace-scroll">
          <div className="space-workspace-content stack page-workspace-content">
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

            <section id="space-pages" className="card stack">
              <h3 className="space-pages-title">Space Pages</h3>
              <p className="subtitle">Browse every page in this space from the current page context.</p>
              <PageTreeNav spaceSlug={spaceSlug} pages={spacePages} activePageSlug={pageSlug} />
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

          <aside className="space-workspace-right page-workspace-right">
            <div className="space-contents-shell page-outline-shell">
              <h3 className="space-contents-heading">On this page</h3>
              <div className="space-contents-groups page-outline-groups">
                <section className="space-contents-group expanded">
                  <div className="space-contents-group-row">
                    <a href="#article-content" className="page-outline-section-link">
                      <span>Page Content</span>
                    </a>
                  </div>
                </section>

                <section className="space-contents-group expanded">
                  <div className="space-contents-group-row">
                    <a href="#space-pages" className="page-outline-section-link">
                      <span>Knowledge Panels</span>
                    </a>
                  </div>
                  <div className="space-contents-children">
                    <a href="#space-pages" className="space-contents-child-link">
                      Space Pages
                    </a>
                    <a href="#backlinks" className="space-contents-child-link">
                      Backlinks
                    </a>
                    <a href="#revision-log" className="space-contents-child-link">
                      Revision Log
                    </a>
                    <a href="#live-presence" className="space-contents-child-link">
                      Live Presence
                    </a>
                  </div>
                </section>
              </div>
              <div className="notice page-help-note">
                <strong>Need help?</strong>
                <p className="subtitle">Owner wallet signatures are required for edit, lifecycle, and ownership updates.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </section>
  )
}
