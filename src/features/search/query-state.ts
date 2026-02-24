import type { PageStatus } from '@/arkiv/types'

export type SearchState = {
  q: string
  status?: PageStatus
}

export function decodeSearchState(searchParams: Record<string, string | string[] | undefined>): SearchState {
  const rawQ = searchParams.q
  const rawStatus = searchParams.status

  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? ''
  const status = (Array.isArray(rawStatus) ? rawStatus[0] : rawStatus) as PageStatus | undefined

  return {
    q,
    status
  }
}
