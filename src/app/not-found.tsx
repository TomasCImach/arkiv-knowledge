import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card stack route-state">
      <span className="route-state-eyebrow">Not found</span>
      <h1 className="route-state-title">Not found</h1>
      <p className="subtitle">The requested space or page does not exist on Arkiv.</p>
      <div className="toolbar route-state-actions">
        <Link href="/" className="button secondary">
          Back to spaces
        </Link>
      </div>
    </div>
  )
}
