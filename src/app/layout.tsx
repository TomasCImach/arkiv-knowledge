import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppShell } from '@/app/_components/app-shell'
import { Providers } from '@/app/providers'
import '@/app/globals.css'

const uiFont = Inter({
  subsets: ['latin'],
  variable: '--font-ui'
})

export const metadata: Metadata = {
  title: 'Arklib',
  description: 'Arklib is an Arkiv-first knowledge base with lifecycle depth, relationships, and expiration-aware collaboration.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={uiFont.variable}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
