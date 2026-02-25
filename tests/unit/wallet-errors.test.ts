import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getBalanceMock: vi.fn()
}))

vi.mock('@/arkiv/clients', () => ({
  getArkivPublicClient: () => ({
    getBalance: mocks.getBalanceMock
  })
}))

vi.mock('@/arkiv/config', () => ({
  getArkivConfig: () => ({
    chainName: 'Kaolin',
    chain: {
      id: 60138453025,
      nativeCurrency: {
        symbol: 'ETH'
      }
    }
  })
}))

import { formatWalletError, runWritePreflight } from '@/lib/wallet'

describe('wallet error handling', () => {
  beforeEach(() => {
    mocks.getBalanceMock.mockReset()
  })

  it('formats undefined transaction errors with nested details and hint', () => {
    const message = formatWalletError({
      message: 'Transaction failed: undefined',
      cause: {
        details: 'insufficient funds for gas * price + value'
      }
    })

    expect(message).not.toContain('undefined')
    expect(message).toContain('insufficient funds')
    expect(message).toContain('Fund your wallet')
  })

  it('falls back to default message when details are missing', () => {
    expect(formatWalletError({ message: '' })).toBe('Transaction failed. Please try again.')
  })

  it('returns actionable guidance for opaque transaction failures', () => {
    expect(formatWalletError({ message: 'Transaction failed: undefined' })).toContain(
      'Verify Kaolin network and wallet funding'
    )
  })

  it('blocks writes on wrong network', async () => {
    const result = await runWritePreflight(
      '0x1111111111111111111111111111111111111111',
      1
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('Wrong network')
    }
  })

  it('blocks writes for zero balance and allows writes when funded', async () => {
    mocks.getBalanceMock.mockResolvedValueOnce(0n)
    const blocked = await runWritePreflight(
      '0x1111111111111111111111111111111111111111',
      60138453025
    )

    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.message).toContain('No ETH on Kaolin')
    }

    mocks.getBalanceMock.mockResolvedValueOnce(10n)
    const allowed = await runWritePreflight(
      '0x1111111111111111111111111111111111111111',
      60138453025
    )

    expect(allowed).toEqual({ ok: true })
  })

  it('blocks writes when balance checks are unavailable', async () => {
    mocks.getBalanceMock.mockRejectedValueOnce(new Error('rpc down'))

    const result = await runWritePreflight(
      '0x1111111111111111111111111111111111111111',
      60138453025
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('Could not verify balance on Kaolin')
    }
  })
})
