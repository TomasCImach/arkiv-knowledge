import Link from 'next/link'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { listSpaces } from '@/arkiv/queries'
import type { ParsedSpace } from '@/arkiv/types'
import { filterListedSpaces } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let spaces: ParsedSpace[] = []
  let loadError = ''

  try {
    spaces = await listSpaces(100)
  } catch (error) {
    loadError = formatReadError(error, 'Failed to load spaces from Arkiv.')
  }
  const listedSpaces = filterListedSpaces(spaces)

  return (
    <section className="stack doc-column dashboard-page">
      <Breadcrumbs items={[{ label: 'Knowledge Base' }]} />

      <div className="card dashboard-hero">
        <div className="stack" style={{ gap: '0.8rem' }}>
          <span className="eyebrow">Arkiv-First Knowledge Base</span>
          <h1 className="title">Arklib</h1>
          <p className="subtitle">
            Public browsing does not require a wallet. Wallet signatures are required only for writes, so anyone can
            explore documentation while ownership stays verifiable.
          </p>
          <div className="toolbar">
            <span className="badge">Core data is stored as Arkiv entities</span>
            <span className="badge">Lifecycle-aware updates and expiration</span>
          </div>
        </div>
        <div className="toolbar dashboard-hero-actions">
          <Link href="/new/space" className="button">
            Create Space
          </Link>
          <Link href="/my/spaces" className="button secondary">
            My Spaces
          </Link>
        </div>
      </div>

      {loadError ? (
        <RouteStateCard
          tone="error"
          title="Space listing temporarily unavailable"
          message={`Arkiv read degraded: ${loadError}`}
          action={<RetryButton label="Retry space query" />}
        />
      ) : null}

      <div className="dashboard-quick-grid">
        <Link href="/new/space" className="dashboard-quick-card">
          <div className="toolbar">
            <span className="material-symbols-outlined dashboard-quick-icon" aria-hidden>
              add_box
            </span>
            <strong>Create Space</strong>
          </div>
          <p className="subtitle">Initialize a new Arkiv-backed documentation space.</p>
        </Link>
        <Link href="/my/spaces" className="dashboard-quick-card">
          <div className="toolbar">
            <span className="material-symbols-outlined dashboard-quick-icon" aria-hidden>
              layers
            </span>
            <strong>My Spaces</strong>
          </div>
          <p className="subtitle">Manage private and unlisted spaces for your verified owner wallet.</p>
        </Link>
        <Link href="/migrate/gitbook" className="dashboard-quick-card">
          <div className="toolbar">
            <span className="material-symbols-outlined dashboard-quick-icon" aria-hidden>
              move_to_inbox
            </span>
            <strong>Migrate GitBook</strong>
          </div>
          <p className="subtitle">Import existing docs while preserving hierarchy and links.</p>
        </Link>
      </div>

      {listedSpaces.length === 0 ? (
        <RouteStateCard
          title="No spaces yet"
          message="Connect the owner wallet and create the first space to start your knowledge base."
          action={<RouteStateLinkAction href="/new/space" label="Create first space" />}
        />
      ) : (
        <div className="card stack">
          <div className="toolbar dashboard-section-head">
            <h2 className="section-title">All Spaces</h2>
            <span className="badge">{listedSpaces.length} total</span>
          </div>
          <div className="space-card-grid">
            {listedSpaces.map((space) => (
              <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="space-card">
                <div className="toolbar doc-list-head">
                  <h3 className="space-card-title">{space.payload.name}</h3>
                  <span className="badge">{space.visibility}</span>
                </div>
                <p className="subtitle">{space.payload.description}</p>
                <div className="toolbar doc-list-meta">
                  <span className="badge">status: {space.status}</span>
                  <span className="subtitle">slug: {space.spaceSlug}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
