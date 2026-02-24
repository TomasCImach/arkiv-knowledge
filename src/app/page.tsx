import Link from 'next/link'
import { listSpaces } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const spaces = await listSpaces(100)

  return (
    <section className="stack">
      <div className="card stack">
        <h1 className="title" style={{ fontFamily: 'var(--font-heading)' }}>
          Arkiv-First Knowledge Base
        </h1>
        <p className="subtitle">
          Public browsing does not require a wallet. Wallet signatures are required only for writes.
        </p>
        <div className="toolbar">
          <Link href="/new/space" className="button">
            Create Space
          </Link>
          <span className="badge">Core data is stored as Arkiv entities</span>
        </div>
      </div>

      {spaces.length === 0 ? (
        <div className="card stack">
          <p className="subtitle">No spaces yet. Connect a wallet and create the first one.</p>
        </div>
      ) : (
        <div className="grid">
          {spaces.map((space) => (
            <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="card stack">
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>{space.payload.name}</h2>
                <span className="badge">{space.visibility}</span>
              </div>
              <p className="subtitle">{space.payload.description}</p>
              <div className="toolbar" style={{ justifyContent: 'space-between' }}>
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
