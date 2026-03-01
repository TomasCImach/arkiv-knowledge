import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditPageForm } from '@/app/_components/edit-page-form'
import { getPageBySlugInSpace, getSpaceBySlug, listPagesBySpaceKey } from '@/arkiv/queries'
import { canViewSpace, parseViewerAddress } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function EditPageRoute({
  params,
  searchParams
}: {
  params: Promise<{ spaceSlug: string; pageSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { spaceSlug, pageSlug } = await params
  const query = await searchParams

  let space
  let page
  let spacePages = []

  try {
    space = await getSpaceBySlug(spaceSlug)
    if (!space) {
      notFound()
    }

    ;[page, spacePages] = await Promise.all([
      getPageBySlugInSpace(space.entityKey, pageSlug),
      listPagesBySpaceKey(space.entityKey)
    ])
  } catch (error) {
    const message = formatReadError(error)
    return (
      <div className="card stack">
        <h1 className="title">Page temporarily unavailable</h1>
        <p className="notice">Could not load page for editing: {message}</p>
      </div>
    )
  }

  if (!space || !page) {
    notFound()
  }
  const viewer = parseViewerAddress(query.viewer)
  if (!canViewSpace(space, viewer)) {
    notFound()
  }

  const withViewer = (value: string) => {
    if (!viewer) {
      return value
    }
    return `${value}${value.includes('?') ? '&' : '?'}viewer=${viewer}`
  }

  return (
    <section className="stack doc-column">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Knowledge Base' },
          { href: withViewer(`/spaces/${spaceSlug}`), label: space.payload.name },
          { href: withViewer(`/spaces/${spaceSlug}/${pageSlug}`), label: page.payload.title },
          { label: 'Edit' }
        ]}
      />
      <EditPageForm
        spaceKey={space.entityKey}
        spaceSlug={spaceSlug}
        page={page}
        availableParents={spacePages}
        viewer={viewer}
      />
    </section>
  )
}
