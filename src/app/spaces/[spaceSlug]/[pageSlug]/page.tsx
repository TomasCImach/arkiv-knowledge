import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { PageMarkdown } from '@/app/_components/page-markdown'
import { PresencePanel } from '@/app/_components/presence-panel'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { fetchCurrentBlock, getPageBySlug, getSpaceBySlug, listBacklinks, listPresenceForPage, listRevisionsByPage } from '@/arkiv/queries'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function PageRoute({ params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }) {
  const { spaceSlug, pageSlug } = await params

  let space
  let page
  try {
    ;[space, page] = await Promise.all([getSpaceBySlug(spaceSlug), getPageBySlug(spaceSlug, pageSlug)])
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

  return (
    <section className="stack">
      <RealtimeRefresh spaceKey={space.entityKey} pageKey={page.entityKey} />

      <div className="card stack">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h1 className="title" style={{ fontFamily: 'var(--font-heading)' }}>
            {page.payload.title}
          </h1>
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
            <div key={link.entityKey} className="toolbar" style={{ justifyContent: 'space-between' }}>
              <Link href={`/spaces/${spaceSlug}/${link.payload.sourceSlug}`} className="button secondary">
                {link.payload.sourceSlug}
              </Link>
              <span className="subtitle">edge {link.entityKey.slice(0, 10)}...</span>
            </div>
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
              <div key={revision.entityKey} className="card stack" style={{ padding: '0.8rem' }}>
                <div className="toolbar" style={{ justifyContent: 'space-between' }}>
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
    </section>
  )
}
