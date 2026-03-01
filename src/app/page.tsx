import Link from 'next/link'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
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
    <section className="stack doc-column">
      <Breadcrumbs items={[{ label: 'Knowledge Base' }]} />
      <div className="card stack">
        <h1 className="title">
          Arkiv-First Knowledge Base
        </h1>
        <p className="subtitle">
          Public browsing does not require a wallet. Wallet signatures are required only for writes.
        </p>
        <div className="toolbar">
          <Link href="/new/space" className="button">
            Create Space
          </Link>
          <Link href="/my/spaces" className="button secondary">
            My Spaces
          </Link>
          <span className="badge">Core data is stored as Arkiv entities</span>
        </div>
        {loadError ? <p className="notice">Arkiv read is temporarily unavailable: {loadError}</p> : null}
      </div>

      {listedSpaces.length === 0 ? (
        <div className="card stack">
          <p className="subtitle">No spaces yet. Connect a wallet and create the first one.</p>
        </div>
      ) : (
        <div className="card stack">
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>All Spaces</h2>
            <span className="badge">{listedSpaces.length} total</span>
          </div>
          {listedSpaces.map((space) => (
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
