import { describe, expect, it } from 'vitest'
import { isNearExpiry, pageExpirationSeconds, EXPIRATION_SECONDS } from '@/arkiv/schema/expiration'

describe('expiration policy', () => {
  it('returns draft and published TTL values', () => {
    expect(pageExpirationSeconds('draft')).toBe(EXPIRATION_SECONDS.pageDraft)
    expect(pageExpirationSeconds('published')).toBe(EXPIRATION_SECONDS.pagePublished)
  })

  it('detects near-expiry entities by block threshold', () => {
    expect(isNearExpiry(1000n, 500n)).toBe(true)
    expect(isNearExpiry(5000n, 500n)).toBe(false)
    expect(isNearExpiry(undefined, 500n)).toBe(false)
  })
})
