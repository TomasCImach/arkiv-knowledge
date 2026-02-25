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

function normalizeBlock(value: bigint | number | string | undefined): bigint | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'bigint') {
    return value
  }

  if (typeof value === 'number') {
    return BigInt(value)
  }

  if (value.length === 0) {
    return undefined
  }

  try {
    return BigInt(value)
  } catch {
    return undefined
  }
}

export function isNearExpiry(
  expiresAtBlock: bigint | number | string | undefined,
  currentBlock: bigint | number | string
): boolean {
  const expiresAt = normalizeBlock(expiresAtBlock)
  const current = normalizeBlock(currentBlock)
  if (expiresAt === undefined || current === undefined) {
    return false
  }

  return expiresAt - current <= NEAR_EXPIRY_THRESHOLD_BLOCKS
}
