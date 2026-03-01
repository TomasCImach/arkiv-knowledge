import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Hex } from 'viem'
import { isAddress, isHex, verifyMessage } from 'viem'
import {
  buildWalletAuthMessage,
  createWalletSessionToken,
  walletAuthCookies,
  walletAuthExpiry
} from '@/features/auth/session'

const isProduction = process.env.NODE_ENV === 'production'

type VerifyBody = {
  address?: string
  message?: string
  signature?: string
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: VerifyBody
  try {
    body = (await request.json()) as VerifyBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const address = body.address?.trim()
  const message = body.message
  const signature = body.signature?.trim()

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: 'Invalid wallet address.' }, { status: 400 })
  }
  if (typeof message !== 'string' || message.length === 0) {
    return NextResponse.json({ error: 'Missing signed message.' }, { status: 400 })
  }
  if (!signature || !isHex(signature)) {
    return NextResponse.json({ error: 'Invalid wallet signature.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const nonce = cookieStore.get(walletAuthCookies.nonce)?.value
  if (!nonce) {
    return NextResponse.json({ error: 'Authentication nonce is missing or expired.' }, { status: 401 })
  }

  const expectedMessage = buildWalletAuthMessage(nonce)
  if (message !== expectedMessage) {
    return NextResponse.json({ error: 'Signed message does not match the issued challenge.' }, { status: 401 })
  }

  let valid = false
  try {
    valid = await verifyMessage({
      address: address as Hex,
      message,
      signature: signature as Hex
    })
  } catch {
    valid = false
  }

  if (!valid) {
    return NextResponse.json({ error: 'Wallet signature verification failed.' }, { status: 401 })
  }

  const sessionToken = createWalletSessionToken(address as Hex)
  const response = NextResponse.json({ ok: true, address }, { status: 200 })
  response.cookies.set(walletAuthCookies.session, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: walletAuthExpiry.sessionMaxAgeSeconds
  })
  response.cookies.set(walletAuthCookies.nonce, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: 0
  })

  return response
}
