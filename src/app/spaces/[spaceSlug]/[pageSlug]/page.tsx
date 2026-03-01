import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { PageTreeNav } from '@/app/_components/page-tree-nav'
import { PageLifecycleForm } from '@/app/_components/page-lifecycle-form'
import { PageMarkdown } from '@/app/_components/page-markdown'
import { PresencePanel } from '@/app/_components/presence-panel'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { TransferOwnershipForm } from '@/app/_components/transfer-ownership-form'
import {
  fetchCurrentBlock,
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
      <section className="stack">
        <div className="card stack">
          <h1 className="title">Page temporarily unavailable</h1>
          <p className="notice">Could not load page data from Arkiv: {message}</p>
          <Link href={`/spaces/${spaceSlug}`} className="button secondary">
            Back to space
          </Link>
        </div>
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

  const [revisionsResult, backlinksResult, presenceResult, blockResult] = await Promise.allSettled([
    listRevisionsByPage(page.entityKey),
    listBacklinks(page.entityKey),
    listPresenceForPage(page.entityKey),
    fetchCurrentBlock()
  ])

  const revisions = revisionsResult.status === 'fulfilled' ? revisionsResult.value : []
  const backlinks = backlinksResult.status === 'fulfilled' ? backlinksResult.value : []
  const activePresence = presenceResult.status === 'fulfilled' ? presenceResult.value : []
  const currentBlock = blockResult.status === 'fulfilled' ? blockResult.value : undefined

  const queryErrors = [
    revisionsResult.status === 'rejected' ? revisionsResult.reason : null,
    backlinksResult.status === 'rejected' ? backlinksResult.reason : null,
    presenceResult.status === 'rejected' ? presenceResult.reason : null,
    blockResult.status === 'rejected' ? blockResult.reason : null
  ]
    .filter(Boolean)
    .map((reason) => formatReadError(reason))
  const ancestors = buildAncestorChain(spacePages, page)

  return (
    <section className="doc-layout">
      <RealtimeRefresh spaceKey={space.entityKey} pageKey={page.entityKey} />

      <aside className="card stack doc-aside">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <strong>{space.payload.name}</strong>
          <Link href={`/spaces/${spaceSlug}/new`} className="badge">
            New Page
          </Link>
        </div>
        <PageTreeNav spaceSlug={spaceSlug} pages={spacePages} activePageSlug={pageSlug} />
      </aside>

      <div className="stack doc-column">
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

        <div className="card stack">
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <h1 className="title">{page.payload.title}</h1>
            <span className="badge">{page.status}</span>
          </div>

          <p className="subtitle">{page.payload.summary}</p>

          <div className="toolbar">
            <Link href={`/spaces/${spaceSlug}/${pageSlug}/edit`} className="button">
              Edit Page
            </Link>
            <span className="badge">Canonical key: {page.entityKey.slice(0, 14)}...</span>
            {currentBlock ? (
              <ExtendEntityButton
                entityKey={page.entityKey}
                owner={page.owner}
                expiresAtBlock={page.expiresAtBlock}
                currentBlock={currentBlock}
                kind="page"
              />
            ) : null}
          </div>
          <p className="subtitle">Editing and ownership transfer are owner-only actions. Public read remains open.</p>
        </div>

        <PageLifecycleForm page={page} viewer={viewer} />

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Transfer Page Ownership</h3>
          <p className="subtitle">Transfers canonical `kb.page` ownership to another wallet.</p>
          <TransferOwnershipForm entityKey={page.entityKey} entityOwner={page.owner} entityLabel="page" />
        </div>
        {queryErrors.length > 0 ? (
          <div className="notice">Some live Arkiv data is temporarily unavailable. Retry to refresh relationship/presence panels.</div>
        ) : null}

        <PageMarkdown markdown={page.payload.bodyMarkdown} />

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Backlinks (from `kb.link` entities)</h3>
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
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Revision Log</h3>
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
                  {currentBlock ? (
                    <ExtendEntityButton
                      entityKey={revision.entityKey}
                      owner={revision.owner}
                      expiresAtBlock={revision.expiresAtBlock}
                      currentBlock={currentBlock}
                      kind="revision"
                    />
                  ) : null}
                </div>
              ))
          )}
        </div>

        <PresencePanel spaceKey={space.entityKey} pageKey={page.entityKey} records={activePresence} />
      </div>
    </section>
  )
}
