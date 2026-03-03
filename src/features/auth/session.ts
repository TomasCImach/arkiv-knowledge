import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { Hex } from 'viem'
import { isAddress } from 'viem'

const AUTH_SESSION_COOKIE = 'kb_wallet_session'
const AUTH_NONCE_COOKIE = 'kb_wallet_nonce'

const NONCE_MAX_AGE_SECONDS = 60 * 5
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

type WalletSessionPayload = {
  address: Hex
  expiresAtMs: number
}

function getAuthSecret(): string {
  const configured = process.env.ARKIV_AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set ARKIV_AUTH_SECRET (or NEXTAUTH_SECRET) to enable wallet auth sessions in production.')
  }

  return 'arkiv-knowledge-dev-auth-secret'
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string): string {
  return createHmac('sha256', getAuthSecret()).update(value).digest('base64url')
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function createWalletAuthNonce(): string {
  return randomBytes(16).toString('hex')
}

export function buildWalletAuthMessage(nonce: string): string {
  return [
    'Authenticate wallet for Arkiv Knowledge private reads.',
    `Nonce: ${nonce}`,
    'This signature will not trigger a blockchain transaction.'
  ].join('\n')
}

export function createWalletSessionToken(address: Hex, nowMs = Date.now()): string {
  const payload: WalletSessionPayload = {
    address,
    expiresAtMs: nowMs + SESSION_MAX_AGE_SECONDS * 1000
  }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function readWalletSessionToken(token: string | undefined, nowMs = Date.now()): Hex | undefined {
  if (!token) {
    return undefined
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return undefined
  }

  const expected = sign(encodedPayload)
  if (!safeEqual(expected, signature)) {
    return undefined
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as WalletSessionPayload
    if (!parsed || typeof parsed.expiresAtMs !== 'number' || !isAddress(parsed.address)) {
      return undefined
    }
    if (parsed.expiresAtMs <= nowMs) {
      return undefined
    }
    return parsed.address as Hex
  } catch {
    return undefined
  }
}

export async function getAuthenticatedViewerAddress(): Promise<Hex | undefined> {
  const cookieStore = await cookies()
  return readWalletSessionToken(cookieStore.get(AUTH_SESSION_COOKIE)?.value)
}

export const walletAuthCookies = {
  nonce: AUTH_NONCE_COOKIE,
  session: AUTH_SESSION_COOKIE
}

export const walletAuthExpiry = {
  nonceMaxAgeSeconds: NONCE_MAX_AGE_SECONDS,
  sessionMaxAgeSeconds: SESSION_MAX_AGE_SECONDS
}
