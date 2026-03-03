import { describe, expect, it } from 'vitest'
import type { ParsedPage } from '@/arkiv/types'
import { buildAncestorChain, buildPageTree, collectDescendantKeys, flattenPageTree } from '@/features/hierarchy/tree'

function makePage(input: {
  key: `0x${string}`
  slug: string
  title: string
  updatedAtMs: number
  parentPageKey?: `0x${string}`
}): ParsedPage {
  return {
    entityKey: input.key,
    owner: '0x1111111111111111111111111111111111111111',
    expiresAtBlock: 1000n,
    spaceKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    spaceSlug: 'space',
    pageSlug: input.slug,
    title: input.title,
    status: 'published',
    parentPageKey: input.parentPageKey,
    updatedAtMs: input.updatedAtMs,
    payload: {
      title: input.title,
      bodyMarkdown: '',
      summary: '',
      createdAt: '2026-02-24T00:00:00.000Z',
      updatedAt: '2026-02-24T00:00:00.000Z'
    }
  }
}

describe('hierarchy tree utilities', () => {
  it('builds deterministic nested tree sorted by updatedAt desc', () => {
    const beta = makePage({
      key: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      slug: 'beta',
      title: 'Beta',
      updatedAtMs: 200
    })
    const alpha = makePage({
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      slug: 'alpha',
      title: 'Alpha',
      updatedAtMs: 100
    })
    const childNew = makePage({
      key: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      slug: 'beta-child-new',
      title: 'Child New',
      updatedAtMs: 90,
      parentPageKey: beta.entityKey
    })
    const childOld = makePage({
      key: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      slug: 'beta-child-old',
      title: 'Child Old',
      updatedAtMs: 20,
      parentPageKey: beta.entityKey
    })

    const tree = buildPageTree([alpha, childOld, beta, childNew])
    const flattened = flattenPageTree(tree)

    expect(flattened.map((entry) => `${entry.depth}:${entry.page.pageSlug}`)).toEqual([
      '0:beta',
      '1:beta-child-new',
      '1:beta-child-old',
      '0:alpha'
    ])
  })

  it('falls back cyclic nodes to renderable roots without recursion loops', () => {
    const one = makePage({
      key: '0x1111111111111111111111111111111111111111111111111111111111111111',
      slug: 'one',
      title: 'One',
      updatedAtMs: 10,
      parentPageKey: '0x2222222222222222222222222222222222222222222222222222222222222222'
    })
    const two = makePage({
      key: '0x2222222222222222222222222222222222222222222222222222222222222222',
      slug: 'two',
      title: 'Two',
      updatedAtMs: 11,
      parentPageKey: one.entityKey
    })

    const flattened = flattenPageTree(buildPageTree([one, two]))
    const keys = new Set(flattened.map((entry) => entry.page.entityKey))

    expect(flattened.length).toBe(2)
    expect(keys.has(one.entityKey)).toBe(true)
    expect(keys.has(two.entityKey)).toBe(true)
  })

  it('collects descendants and ancestors correctly', () => {
    const root = makePage({
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      slug: 'root',
      title: 'Root',
      updatedAtMs: 100
    })
    const child = makePage({
      key: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      slug: 'child',
      title: 'Child',
      updatedAtMs: 90,
      parentPageKey: root.entityKey
    })
    const grandchild = makePage({
      key: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      slug: 'grandchild',
      title: 'Grandchild',
      updatedAtMs: 80,
      parentPageKey: child.entityKey
    })

    const pages = [root, child, grandchild]
    const descendants = collectDescendantKeys(pages, root.entityKey)
    expect(descendants.has(child.entityKey)).toBe(true)
    expect(descendants.has(grandchild.entityKey)).toBe(true)

    const ancestors = buildAncestorChain(pages, grandchild)
    expect(ancestors.map((entry) => entry.pageSlug)).toEqual(['root', 'child'])
  })
})
