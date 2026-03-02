import Link from 'next/link'
import type { ReactNode } from 'react'
import { MobileNavDrawer } from '@/app/_components/mobile-nav-drawer'
import { listSpaces, listSpacesOwnedBy } from '@/arkiv/queries'
import type { ParsedSpace } from '@/arkiv/types'
import { WalletStatus } from '@/app/_components/wallet-status'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { filterListedSpaces } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export async function AppShell({ children }: { children: ReactNode }) {
  const viewer = await getAuthenticatedViewerAddress()
  let spaces: ParsedSpace[] = []
  let ownerSpaces: ParsedSpace[] = []
  const navErrors: string[] = []

  try {
    spaces = await listSpaces(40)
  } catch (error) {
    navErrors.push(formatReadError(error, 'Could not load spaces.'))
  }

  if (viewer) {
    try {
      ownerSpaces = await listSpacesOwnedBy(viewer, 200)
    } catch (error) {
      navErrors.push(formatReadError(error, 'Could not load private owner spaces.'))
    }
  }

  const publicSpaces = filterListedSpaces(spaces)
  const mergedByKey = new Map<string, ParsedSpace>()
  for (const space of [...publicSpaces, ...ownerSpaces]) {
    mergedByKey.set(space.entityKey, space)
  }
  const listedSpaces = Array.from(mergedByKey.values()).sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  const navError = navErrors.join(' ')
  const sidebarContent = (
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
        <span className="sidebar-label">{viewer ? 'Spaces (Public + Owned)' : 'Spaces'}</span>
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
  )

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
          <div className="toolbar app-toolbar">
            <MobileNavDrawer>{sidebarContent}</MobileNavDrawer>
            <Link href="/search/pages" className="button secondary desktop-nav-action">
              Search Pages
            </Link>
            <Link href="/my/spaces" className="button secondary desktop-nav-action">
              My Spaces
            </Link>
            <Link href="/new/space" className="button secondary desktop-nav-action">
              New Space
            </Link>
            <WalletStatus />
          </div>
        </nav>
      </header>
      <div className="app-body">
        <aside className="app-sidebar app-sidebar-desktop">
          {sidebarContent}
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
