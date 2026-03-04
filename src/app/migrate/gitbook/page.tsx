import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { GitBookMigrationTool } from '@/app/_components/gitbook-migration-tool'

export const dynamic = 'force-dynamic'

export default function GitBookMigrationRoute() {
  return (
    <section className="stack doc-column">
      <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: 'GitBook Migration' }]} />
      <div className="card stack">
        <h1 className="title">Migrate from GitBook Markdown</h1>
        <p className="subtitle">
          This converter normalizes known GitBook markdown syntax so pages can be pasted directly into Arkiv Knowledge.
        </p>
      </div>
      <GitBookMigrationTool />
    </section>
  )
}
