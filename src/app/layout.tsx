import type { Metadata } from 'next'
import { Space_Grotesk, Noto_Serif } from 'next/font/google'
import { AppShell } from '@/app/_components/app-shell'
import { Providers } from '@/app/providers'
import '@/app/globals.css'

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading'
})

const bodyFont = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-body'
})

export const metadata: Metadata = {
  title: 'Arklib',
  description: 'Arklib is an Arkiv-first knowledge base with lifecycle depth, relationships, and expiration-aware collaboration.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
