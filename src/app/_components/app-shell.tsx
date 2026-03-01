import Link from 'next/link'
import type { ReactNode } from 'react'
import { listSpaces } from '@/arkiv/queries'
import type { ParsedSpace } from '@/arkiv/types'
import { WalletStatus } from '@/app/_components/wallet-status'
import { filterListedSpaces } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export async function AppShell({ children }: { children: ReactNode }) {
  let spaces: ParsedSpace[] = []
  let navError = ''

  try {
    spaces = await listSpaces(40)
  } catch (error) {
    navError = formatReadError(error, 'Could not load spaces.')
  }
  const listedSpaces = filterListedSpaces(spaces)

  return (
    <div className="app-frame">
      <header className="app-header">
        <nav className="app-header-inner">
          <div className="app-brand-block">
            <Link href="/" className="app-brand">
              Arkiv Knowledge
            </Link>
            <span className="subtitle">BookStack-style Arkiv documentation workspace</span>
          </div>
          <div className="toolbar">
            <Link href="/search/pages" className="button secondary">
              Search Pages
            </Link>
            <Link href="/my/spaces" className="button secondary">
              My Spaces
            </Link>
            <Link href="/new/space" className="button secondary">
              New Space
            </Link>
            <WalletStatus />
          </div>
        </nav>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <div className="card stack sidebar-panel">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <strong>Navigation</strong>
              <div className="toolbar" style={{ gap: '0.35rem' }}>
                <Link href="/" className="badge">
                  Home
                </Link>
                <Link href="/my/spaces" className="badge">
                  My Spaces
                </Link>
              </div>
            </div>
            <div className="stack" style={{ gap: '0.4rem' }}>
              <span className="sidebar-label">Spaces</span>
              {navError ? <p className="notice">Sidebar degraded: {navError}</p> : null}
              {listedSpaces.length === 0 ? (
                <p className="subtitle">No spaces yet.</p>
              ) : (
                <div className="nav-tree">
                  {listedSpaces.map((space) => (
                    <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="nav-tree-item">
                      <span>{space.payload.name}</span>
                      <span className="nav-tree-meta">{space.spaceSlug}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
