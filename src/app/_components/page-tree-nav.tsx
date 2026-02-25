import Link from 'next/link'
import type { ParsedPage } from '@/arkiv/types'
import { listPagesInTreeOrder } from '@/features/hierarchy/tree'

type PageTreeNavProps = {
  spaceSlug: string
  pages: ParsedPage[]
  activePageSlug?: string
  emptyMessage?: string
}

export function PageTreeNav({ spaceSlug, pages, activePageSlug, emptyMessage = 'No pages created yet.' }: PageTreeNavProps) {
  if (pages.length === 0) {
    return <p className="subtitle">{emptyMessage}</p>
  }

  const tree = listPagesInTreeOrder(pages)

  return (
    <div className="nav-tree">
      {tree.map(({ page, depth }) => (
        <Link
          key={page.entityKey}
          href={`/spaces/${spaceSlug}/${page.pageSlug}`}
          className={`nav-tree-item ${page.pageSlug === activePageSlug ? 'active' : ''}`}
          style={{ marginLeft: `${depth * 0.75}rem` }}
        >
          <span>{page.payload.title}</span>
          <span className="nav-tree-meta">{page.status}</span>
        </Link>
      ))}
    </div>
  )
}
