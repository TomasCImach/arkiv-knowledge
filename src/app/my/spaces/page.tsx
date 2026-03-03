import Link from 'next/link'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { listSpacesOwnedBy } from '@/arkiv/queries'
import type { ParsedSpace } from '@/arkiv/types'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function MySpacesPage() {
  const viewer = await getAuthenticatedViewerAddress()

  if (!viewer) {
    return (
      <section className="stack doc-column">
        <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: 'My Spaces' }]} />
        <RouteStateCard
          title="My Spaces"
          message="Verify private access in the header after connecting your wallet to list your private and unlisted spaces."
          action={<RouteStateLinkAction href="/" label="Back to knowledge base" secondary />}
        />
      </section>
    )
  }

  let spaces: ParsedSpace[] = []
  let loadError = ''
  try {
    spaces = await listSpacesOwnedBy(viewer, 200)
  } catch (error) {
    loadError = formatReadError(error, 'Failed to load owned spaces from Arkiv.')
  }

  return (
    <section className="stack doc-column">
      <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: 'My Spaces' }]} />
      <div className="card stack">
        <h1 className="title">My Spaces</h1>
        <p className="subtitle">Owner view for your spaces, including private and unlisted visibility.</p>
        <div className="toolbar">
          <span className="badge">viewer: {viewer.slice(0, 10)}...</span>
          <span className="badge">{spaces.length} spaces</span>
        </div>
      </div>

      {loadError ? (
        <RouteStateCard
          tone="error"
          title="Could not refresh owned spaces"
          message={`Owned-space query degraded: ${loadError}`}
          action={<RetryButton label="Retry owned spaces query" />}
        />
      ) : null}

      {spaces.length === 0 ? (
        <RouteStateCard
          title="No owned spaces found"
          message="Create a space with this wallet to populate the owner view."
          action={<RouteStateLinkAction href="/new/space" label="Create space" />}
        />
      ) : (
        <div className="card stack">
          {spaces.map((space) => (
            <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="doc-list-item">
              <div className="toolbar doc-list-head">
                <h2 style={{ margin: 0 }}>{space.payload.name}</h2>
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
      )}
    </section>
  )
}
