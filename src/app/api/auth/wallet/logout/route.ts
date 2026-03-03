import { NextResponse } from 'next/server'
import { walletAuthCookies } from '@/features/auth/session'

const isProduction = process.env.NODE_ENV === 'production'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 })
  for (const cookieName of [walletAuthCookies.session, walletAuthCookies.nonce]) {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 0
    })
  }
  return response
}
