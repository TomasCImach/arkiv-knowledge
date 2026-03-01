import Link from 'next/link'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
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
        <div className="card stack">
          <h1 className="title">My Spaces</h1>
          <p className="subtitle">
            Verify private access in the header after connecting your wallet to list your private and unlisted spaces.
          </p>
        </div>
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
        {loadError ? <p className="notice">Owned-space query degraded: {loadError}</p> : null}
      </div>

      {spaces.length === 0 ? (
        <div className="card stack">
          <p className="subtitle">No spaces found for the authenticated wallet.</p>
        </div>
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
