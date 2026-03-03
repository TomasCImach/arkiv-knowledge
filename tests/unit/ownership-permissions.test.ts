import { describe, expect, it } from 'vitest'
import { canManageOwnedEntity, equalAddress } from '@/features/ownership/permissions'

describe('ownership permissions', () => {
  it('compares addresses case-insensitively', () => {
    expect(equalAddress('0xAbc', '0xaBc')).toBe(true)
  })

  it('returns false when owner or connected address is missing', () => {
    expect(canManageOwnedEntity(undefined, '0xabc')).toBe(false)
    expect(canManageOwnedEntity('0xabc', undefined)).toBe(false)
  })
})
