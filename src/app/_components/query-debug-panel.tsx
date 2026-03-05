import type { Predicate } from '@arkiv-network/sdk/query'
import { isTechnicalDetailsUiEnabled } from '@/lib/ui-flags'

type QueryDebugPanelProps = {
  title: string
  summary: Record<string, string>
  predicates: Predicate[]
}

export function QueryDebugPanel({ title, summary, predicates }: QueryDebugPanelProps) {
  if (!isTechnicalDetailsUiEnabled()) {
    return null
  }

  return (
    <section className="card stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <span className="badge">debug only</span>
      </div>
      <pre className="query-debug">{JSON.stringify(summary, null, 2)}</pre>
      <pre className="query-debug">{JSON.stringify(predicates, null, 2)}</pre>
    </section>
  )
}
