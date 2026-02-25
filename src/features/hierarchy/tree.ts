import type { Hex } from 'viem'
import type { ParsedPage } from '@/arkiv/types'

export type PageTreeNode = {
  page: ParsedPage
  children: PageTreeNode[]
}

export type FlattenedPageTreeNode = {
  page: ParsedPage
  depth: number
}

function comparePages(a: ParsedPage, b: ParsedPage): number {
  if (a.updatedAtMs !== b.updatedAtMs) {
    return b.updatedAtMs - a.updatedAtMs
  }

  const titleCompare = a.payload.title.localeCompare(b.payload.title)
  if (titleCompare !== 0) {
    return titleCompare
  }

  return a.pageSlug.localeCompare(b.pageSlug)
}

function buildChildrenByParent(pages: ParsedPage[]): Map<Hex, ParsedPage[]> {
  const pageByKey = new Map(pages.map((page) => [page.entityKey, page]))
  const childrenByParent = new Map<Hex, ParsedPage[]>()

  for (const page of pages) {
    const parentKey = page.parentPageKey
    if (!parentKey || parentKey === page.entityKey || !pageByKey.has(parentKey)) {
      continue
    }

    const children = childrenByParent.get(parentKey) ?? []
    children.push(page)
    childrenByParent.set(parentKey, children)
  }

  for (const [parentKey, children] of childrenByParent.entries()) {
    childrenByParent.set(parentKey, children.slice().sort(comparePages))
  }

  return childrenByParent
}

function hasValidParent(page: ParsedPage, pageByKey: Map<Hex, ParsedPage>): boolean {
  const parentKey = page.parentPageKey
  if (!parentKey) {
    return false
  }

  if (parentKey === page.entityKey) {
    return false
  }

  return pageByKey.has(parentKey)
}

export function buildPageTree(pages: ParsedPage[]): PageTreeNode[] {
  if (pages.length === 0) {
    return []
  }

  const pageByKey = new Map(pages.map((page) => [page.entityKey, page]))
  const childrenByParent = buildChildrenByParent(pages)
  const rootCandidates = pages.filter((page) => !hasValidParent(page, pageByKey)).sort(comparePages)
  const visited = new Set<Hex>()

  const buildNode = (page: ParsedPage, path: Set<Hex>): PageTreeNode => {
    if (path.has(page.entityKey)) {
      return {
        page,
        children: []
      }
    }

    visited.add(page.entityKey)

    const nextPath = new Set(path)
    nextPath.add(page.entityKey)

    const childPages = childrenByParent.get(page.entityKey) ?? []
    const children = childPages
      .filter((child) => !nextPath.has(child.entityKey))
      .map((child) => buildNode(child, nextPath))

    return {
      page,
      children
    }
  }

  const roots = rootCandidates.map((root) => buildNode(root, new Set<Hex>()))

  const remaining = pages.filter((page) => !visited.has(page.entityKey)).sort(comparePages)
  for (const orphan of remaining) {
    roots.push(buildNode(orphan, new Set<Hex>()))
  }

  return roots
}

export function flattenPageTree(nodes: PageTreeNode[]): FlattenedPageTreeNode[] {
  const flattened: FlattenedPageTreeNode[] = []

  const walk = (node: PageTreeNode, depth: number) => {
    flattened.push({
      page: node.page,
      depth
    })

    for (const child of node.children) {
      walk(child, depth + 1)
    }
  }

  for (const node of nodes) {
    walk(node, 0)
  }

  return flattened
}

export function listPagesInTreeOrder(pages: ParsedPage[]): FlattenedPageTreeNode[] {
  return flattenPageTree(buildPageTree(pages))
}

export function collectDescendantKeys(pages: ParsedPage[], rootKey: Hex): Set<Hex> {
  const childrenByParent = buildChildrenByParent(pages)
  const descendants = new Set<Hex>()
  const stack = [...(childrenByParent.get(rootKey) ?? []).map((page) => page.entityKey)]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || descendants.has(current) || current === rootKey) {
      continue
    }

    descendants.add(current)
    const children = childrenByParent.get(current) ?? []
    for (const child of children) {
      if (!descendants.has(child.entityKey)) {
        stack.push(child.entityKey)
      }
    }
  }

  return descendants
}

export function buildAncestorChain(pages: ParsedPage[], page: ParsedPage): ParsedPage[] {
  const pageByKey = new Map(pages.map((entry) => [entry.entityKey, entry]))
  const ancestors: ParsedPage[] = []
  const seen = new Set<Hex>([page.entityKey])

  let cursor = page.parentPageKey
  while (cursor && !seen.has(cursor)) {
    const parent = pageByKey.get(cursor)
    if (!parent) {
      break
    }

    ancestors.push(parent)
    seen.add(cursor)
    cursor = parent.parentPageKey
  }

  return ancestors.reverse()
}
