import type { Hex } from 'viem'
import { isAddress } from 'viem'
import type { GlobalPageSearchInput, PageParentMode, PageSortMode, PageStatus } from '@/arkiv/types'

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function parseStatus(value: string | undefined): PageStatus | undefined {
  if (!value) {
    return undefined
  }

  if (value === 'draft' || value === 'published' || value === 'archived') {
    return value
  }

  return undefined
}

function parseParentMode(value: string | undefined): PageParentMode | undefined {
  if (!value) {
    return undefined
  }

  if (value === 'all' || value === 'root' || value === 'child') {
    return value
  }

  return undefined
}

function parseSort(value: string | undefined): PageSortMode | undefined {
  if (!value) {
    return undefined
  }

  if (value === 'updated_desc' || value === 'updated_asc' || value === 'title_asc') {
    return value
  }

  return undefined
}

function parseOwner(value: string | undefined): Hex | undefined {
  if (!value || !isAddress(value)) {
    return undefined
  }

  return value as Hex
}

export function parseGlobalPageSearch(searchParams: Record<string, string | string[] | undefined>): GlobalPageSearchInput {
  const spaceSlug = firstValue(searchParams.spaceSlug)
  const q = firstValue(searchParams.q)

  return {
    spaceSlug: spaceSlug && spaceSlug.length > 0 ? spaceSlug : undefined,
    status: parseStatus(firstValue(searchParams.status)),
    parentMode: parseParentMode(firstValue(searchParams.parent)),
    sort: parseSort(firstValue(searchParams.sort)),
    owner: parseOwner(firstValue(searchParams.owner)),
    q: q && q.length > 0 ? q : undefined
  }
}
