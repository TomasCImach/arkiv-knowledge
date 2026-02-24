import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExtendEntityButton } from '@/app/_components/extend-entity-button'
import { PageMarkdown } from '@/app/_components/page-markdown'
import { PresencePanel } from '@/app/_components/presence-panel'
import { RealtimeRefresh } from '@/app/_components/realtime-refresh'
import { fetchCurrentBlock, getPageBySlug, getSpaceBySlug, listBacklinks, listPresenceForPage, listRevisionsByPage } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function PageRoute({ params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }) {
  const { spaceSlug, pageSlug } = await params

  const [space, page] = await Promise.all([getSpaceBySlug(spaceSlug), getPageBySlug(spaceSlug, pageSlug)])

  if (!space || !page) {
    notFound()
  }

  const [revisions, backlinks, activePresence, currentBlock] = await Promise.all([
    listRevisionsByPage(page.entityKey),
    listBacklinks(page.entityKey),
    listPresenceForPage(page.entityKey),
    fetchCurrentBlock()
  ])

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
          <ExtendEntityButton
            entityKey={page.entityKey}
            owner={page.owner}
            expiresAtBlock={page.expiresAtBlock}
            currentBlock={currentBlock}
            kind="page"
          />
        </div>
      </div>

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
                <ExtendEntityButton
                  entityKey={revision.entityKey}
                  owner={revision.owner}
                  expiresAtBlock={revision.expiresAtBlock}
                  currentBlock={currentBlock}
                  kind="revision"
                />
              </div>
            ))
        )}
      </div>

      <PresencePanel spaceKey={space.entityKey} pageKey={page.entityKey} records={activePresence} />
    </section>
  )
}
