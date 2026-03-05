import { describe, expect, it } from 'vitest'
import { buildWalletAuthMessage, createWalletSessionToken, readWalletSessionToken } from '@/features/auth/session'

const OWNER = '0x1111111111111111111111111111111111111111'

describe('wallet auth session helpers', () => {
  it('builds deterministic wallet auth challenge text', () => {
    const message = buildWalletAuthMessage('abc123')
    expect(message).toContain('Authenticate wallet for Arklib private reads.')
    expect(message).toContain('Nonce: abc123')
  })

  it('round-trips signed wallet session token', () => {
    const token = createWalletSessionToken(OWNER, 1_000)
    expect(readWalletSessionToken(token, 1_001)).toBe(OWNER)
  })

  it('rejects tampered or expired wallet session token', () => {
    const token = createWalletSessionToken(OWNER, 1_000)
    const tampered = `${token}x`

    expect(readWalletSessionToken(tampered, 1_001)).toBeUndefined()
    expect(readWalletSessionToken(token, 1_000 + 8 * 60 * 60 * 1000 + 1)).toBeUndefined()
  })
})
