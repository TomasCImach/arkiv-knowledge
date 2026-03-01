import type { Hex } from 'viem'
import { isAddress } from 'viem'
import type { ParsedPage, ParsedSpace } from '@/arkiv/types'
import { equalAddress } from '@/features/ownership/permissions'

export type QueryValue = string | string[] | undefined

export function firstQueryValue(value: QueryValue): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export function parseViewerAddress(value: QueryValue): Hex | undefined {
  const raw = firstQueryValue(value).trim()
  if (!raw || !isAddress(raw)) {
    return undefined
  }

  return raw as Hex
}

export function canViewSpace(space: Pick<ParsedSpace, 'visibility' | 'owner'>, viewer: string | undefined): boolean {
  if (space.visibility === 'public' || space.visibility === 'unlisted') {
    return true
  }

  return equalAddress(space.owner, viewer)
}

export function shouldListSpace(space: Pick<ParsedSpace, 'visibility'>): boolean {
  return space.visibility === 'public'
}

export function filterListedSpaces<T extends Pick<ParsedSpace, 'visibility'>>(spaces: T[]): T[] {
  return spaces.filter(shouldListSpace)
}

export function filterPagesByVisibleSpaces(
  pages: ParsedPage[],
  spaces: ParsedSpace[],
  viewer: string | undefined
): ParsedPage[] {
  const spaceByKey = new Map(spaces.map((space) => [space.entityKey, space]))

  return pages.filter((page) => {
    const space = spaceByKey.get(page.spaceKey)
    if (!space) {
      return false
    }

    return canViewSpace(space, viewer)
  })
}
