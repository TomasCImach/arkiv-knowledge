import type { Hex } from 'viem'
import { isAddress } from 'viem'

type SessionResponse = {
  address: string | null
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string }
    if (payload?.error && typeof payload.error === 'string') {
      return payload.error
    }
  } catch {
    // no-op
  }
  return fallback
}

export async function readWalletSessionAddress(): Promise<Hex | undefined> {
  const response = await fetch('/api/auth/wallet/session', {
    method: 'GET',
    cache: 'no-store'
  })

  if (!response.ok) {
    return undefined
  }

  const payload = (await response.json()) as SessionResponse
  if (!payload.address || !isAddress(payload.address)) {
    return undefined
  }

  return payload.address as Hex
}

export async function ensureWalletReadSession(
  address: Hex,
  signMessage: (message: string) => Promise<Hex>
): Promise<void> {
  const existingAddress = await readWalletSessionAddress()
  if (existingAddress && existingAddress.toLowerCase() === address.toLowerCase()) {
    return
  }

  const nonceResponse = await fetch('/api/auth/wallet/nonce', {
    method: 'GET',
    cache: 'no-store'
  })
  if (!nonceResponse.ok) {
    throw new Error(await readErrorMessage(nonceResponse, 'Failed to request wallet auth challenge.'))
  }

  const noncePayload = (await nonceResponse.json()) as { message?: string }
  if (typeof noncePayload.message !== 'string' || !noncePayload.message) {
    throw new Error('Wallet auth challenge is missing.')
  }

  const signature = await signMessage(noncePayload.message)
  const verifyResponse = await fetch('/api/auth/wallet/verify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      address,
      message: noncePayload.message,
      signature
    })
  })
  if (!verifyResponse.ok) {
    throw new Error(await readErrorMessage(verifyResponse, 'Wallet auth verification failed.'))
  }
}

export async function clearWalletReadSession(): Promise<void> {
  await fetch('/api/auth/wallet/logout', {
    method: 'POST'
  })
}
