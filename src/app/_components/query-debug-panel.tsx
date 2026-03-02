import type { Predicate } from '@arkiv-network/sdk/query'

type QueryDebugPanelProps = {
  title: string
  summary: Record<string, string>
  predicates: Predicate[]
}

function isQueryDebugEnabled() {
  const rawValue = process.env.ARKIV_QUERY_DEBUG ?? process.env.NEXT_PUBLIC_ARKIV_QUERY_DEBUG
  if (!rawValue) {
    return false
  }

  const normalized = rawValue.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export function QueryDebugPanel({ title, summary, predicates }: QueryDebugPanelProps) {
  if (!isQueryDebugEnabled()) {
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
