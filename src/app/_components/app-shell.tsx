import Link from 'next/link'
import type { ReactNode } from 'react'
import { WalletStatus } from '@/app/_components/wallet-status'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="app-header">
        <nav>
          <div className="toolbar">
            <Link href="/" className="button secondary">
              Arkiv Knowledge
            </Link>
            <Link href="/new/space" className="button secondary">
              New Space
            </Link>
          </div>
          <WalletStatus />
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}
