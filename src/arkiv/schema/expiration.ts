import type { ExpirationKind, PageStatus } from '@/arkiv/types'

export const EXPIRATION_SECONDS: Record<ExpirationKind, number> = {
  space: 60 * 60 * 24 * 365,
  pagePublished: 60 * 60 * 24 * 365,
  pageDraft: 60 * 60 * 24 * 30,
  revision: 60 * 60 * 24 * 180,
  link: 60 * 60 * 24 * 30,
  presence: 90
}

export const NEAR_EXPIRY_THRESHOLD_BLOCKS = 600n

export function pageExpirationSeconds(status: PageStatus): number {
  return status === 'draft' ? EXPIRATION_SECONDS.pageDraft : EXPIRATION_SECONDS.pagePublished
}

export function isNearExpiry(expiresAtBlock: bigint | undefined, currentBlock: bigint): boolean {
  if (!expiresAtBlock) {
    return false
  }

  return expiresAtBlock - currentBlock <= NEAR_EXPIRY_THRESHOLD_BLOCKS
}
