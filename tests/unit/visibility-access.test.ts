import { describe, expect, it } from 'vitest'
import type { ParsedPage, ParsedSpace } from '@/arkiv/types'
import {
  canViewSpace,
  filterListedSpaces,
  filterPagesByVisibleSpaces,
  parseViewerAddress,
  shouldListSpace
} from '@/features/visibility/access'

const OWNER = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'

const SPACE_PUBLIC = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const SPACE_UNLISTED = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const SPACE_PRIVATE = '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'

function buildSpace(
  entityKey: `0x${string}`,
  visibility: ParsedSpace['visibility'],
  owner: `0x${string}` = OWNER
): ParsedSpace {
  return {
    entityKey,
    owner,
    expiresAtBlock: 10n,
    spaceSlug: `space-${entityKey.slice(-4)}`,
    visibility,
    status: 'active',
    updatedAtMs: 1,
    payload: {
      name: `Space ${entityKey.slice(-4)}`,
      description: 'Space description',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    }
  }
}

function buildPage(entityKey: `0x${string}`, spaceKey: `0x${string}`, pageSlug: string): ParsedPage {
  return {
    entityKey,
    owner: OWNER,
    expiresAtBlock: 10n,
    spaceKey,
    spaceSlug: `space-${spaceKey.slice(-4)}`,
    pageSlug,
    title: pageSlug,
    status: 'published',
    updatedAtMs: 1,
    payload: {
      title: pageSlug,
      bodyMarkdown: pageSlug,
      summary: pageSlug,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z'
    }
  }
}

describe('visibility access helpers', () => {
  it('parses viewer only when a valid address is provided', () => {
    expect(parseViewerAddress(undefined)).toBeUndefined()
    expect(parseViewerAddress('not-an-address')).toBeUndefined()
    expect(parseViewerAddress(OWNER)).toBe(OWNER)
  })

  it('allows private reads only for the owner, while public and unlisted stay public', () => {
    const privateSpace = buildSpace(SPACE_PRIVATE, 'private', OWNER)
    const publicSpace = buildSpace(SPACE_PUBLIC, 'public', OWNER)
    const unlistedSpace = buildSpace(SPACE_UNLISTED, 'unlisted', OWNER)

    expect(canViewSpace(privateSpace, undefined)).toBe(false)
    expect(canViewSpace(privateSpace, OTHER)).toBe(false)
    expect(canViewSpace(privateSpace, OWNER.toUpperCase())).toBe(true)
    expect(canViewSpace(publicSpace, undefined)).toBe(true)
    expect(canViewSpace(unlistedSpace, undefined)).toBe(true)
  })

  it('lists only public spaces in broad navigation surfaces', () => {
    const spaces = [
      buildSpace(SPACE_PUBLIC, 'public'),
      buildSpace(SPACE_UNLISTED, 'unlisted'),
      buildSpace(SPACE_PRIVATE, 'private')
    ]

    expect(shouldListSpace(spaces[0])).toBe(true)
    expect(shouldListSpace(spaces[1])).toBe(false)
    expect(shouldListSpace(spaces[2])).toBe(false)
    expect(filterListedSpaces(spaces).map((space) => space.entityKey)).toEqual([SPACE_PUBLIC])
  })

  it('filters global page results against visible spaces and owner context', () => {
    const spaces = [
      buildSpace(SPACE_PUBLIC, 'public'),
      buildSpace(SPACE_UNLISTED, 'unlisted'),
      buildSpace(SPACE_PRIVATE, 'private')
    ]
    const pages = [
      buildPage('0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', SPACE_PUBLIC, 'public-doc'),
      buildPage('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', SPACE_UNLISTED, 'unlisted-doc'),
      buildPage('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', SPACE_PRIVATE, 'private-doc')
    ]

    expect(filterPagesByVisibleSpaces(pages, spaces, undefined).map((page) => page.pageSlug)).toEqual([
      'public-doc',
      'unlisted-doc'
    ])
    expect(filterPagesByVisibleSpaces(pages, spaces, OWNER).map((page) => page.pageSlug)).toEqual([
      'public-doc',
      'unlisted-doc',
      'private-doc'
    ])
  })
})
