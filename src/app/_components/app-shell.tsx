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
  const ownedSpaces = ownerSpaces.slice().sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  const ownedKeys = new Set(ownedSpaces.map((space) => space.entityKey))
  const visiblePublicSpaces = publicSpaces
    .filter((space) => !ownedKeys.has(space.entityKey))
    .slice()
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  const hasOwnedSection = ownedSpaces.length > 0
  const hasPublicSection = visiblePublicSpaces.length > 0
  const showSectionSubtitles = hasOwnedSection && hasPublicSection
  const navError = navErrors.join(' ')
  const sidebarContent = (
    <div className="card stack sidebar-panel">
      <div className="stack" style={{ gap: '0.7rem' }}>
        <span className="sidebar-kicker">Navigation</span>
        <nav className="sidebar-nav-list">
          <Link href="/" className="sidebar-nav-item">
            <span className="material-symbols-outlined" aria-hidden>
              home
            </span>
            <span>Home</span>
          </Link>
          <Link href="/my/spaces" className="sidebar-nav-item">
            <span className="material-symbols-outlined" aria-hidden>
              layers
            </span>
            <span>My Spaces</span>
          </Link>
          <Link href="/migrate/gitbook" className="sidebar-nav-item">
            <span className="material-symbols-outlined" aria-hidden>
              cloud_sync
            </span>
            <span>GitBook Migration</span>
          </Link>
          <Link href="/new/space" className="sidebar-nav-item">
            <span className="material-symbols-outlined" aria-hidden>
              add_circle
            </span>
            <span>New Space</span>
          </Link>
        </nav>
      </div>

      <div className="stack sidebar-space-groups">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <span className="sidebar-label">Spaces</span>
          <Link href="/new/space" className="badge">
            + Add
          </Link>
        </div>
        {navError ? <p className="notice">Sidebar degraded: {navError}</p> : null}
        {!hasOwnedSection && !hasPublicSection ? (
          <p className="subtitle">No spaces yet.</p>
        ) : (
          <>
            {hasOwnedSection ? (
              <div className="stack sidebar-space-section" style={{ gap: '0.4rem' }}>
                {showSectionSubtitles ? <span className="sidebar-subtitle">Owned</span> : null}
                <div className="nav-tree">
                  {ownedSpaces.map((space) => (
                    <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="nav-tree-item">
                      <span>{space.payload.name}</span>
                      <span className="nav-tree-meta">slug: {space.spaceSlug}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {hasPublicSection ? (
              <div className="stack sidebar-space-section" style={{ gap: '0.4rem' }}>
                {showSectionSubtitles ? <span className="sidebar-subtitle">Public</span> : null}
                <div className="nav-tree">
                  {visiblePublicSpaces.map((space) => (
                    <Link key={space.entityKey} href={`/spaces/${space.spaceSlug}`} className="nav-tree-item">
                      <span>{space.payload.name}</span>
                      <span className="nav-tree-meta">slug: {space.spaceSlug}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
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
              <span className="app-brand-mark">Arklib</span>
              <span className="app-brand-kicker">Arkiv Knowledge Base</span>
            </Link>
            <div className="toolbar app-primary-nav">
              <Link href="/my/spaces" className="desktop-nav-action">
                My Spaces
              </Link>
              <Link href="/migrate/gitbook" className="desktop-nav-action">
                Migrate GitBook
              </Link>
              <Link href="/new/space" className="desktop-nav-action">
                New Space
              </Link>
            </div>
          </div>
          <div className="toolbar app-toolbar">
            <MobileNavDrawer>{sidebarContent}</MobileNavDrawer>
            <Link href="/search/pages" className="search-shell desktop-nav-action" aria-label="Search pages">
              <span className="material-symbols-outlined" aria-hidden>
                search
              </span>
              <span>Search documentation...</span>
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
