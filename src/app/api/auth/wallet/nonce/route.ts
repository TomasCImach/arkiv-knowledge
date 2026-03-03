import { NextResponse } from 'next/server'
import {
  buildWalletAuthMessage,
  createWalletAuthNonce,
  walletAuthCookies,
  walletAuthExpiry
} from '@/features/auth/session'

const isProduction = process.env.NODE_ENV === 'production'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const nonce = createWalletAuthNonce()
  const message = buildWalletAuthMessage(nonce)

  const response = NextResponse.json({ message }, { status: 200 })
  response.cookies.set(walletAuthCookies.nonce, nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: walletAuthExpiry.nonceMaxAgeSeconds
  })

  return response
}
