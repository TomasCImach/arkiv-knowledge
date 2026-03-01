import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { CreatePageForm } from '@/app/_components/create-page-form'
import { getSpaceBySlug, listPagesBySpaceKey } from '@/arkiv/queries'
import { canViewSpace, parseViewerAddress } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function NewPageRoute({
  params,
  searchParams
}: {
  params: Promise<{ spaceSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { spaceSlug } = await params
  const query = await searchParams
  let space
  let spacePages = []

  try {
    space = await getSpaceBySlug(spaceSlug)
    if (!space) {
      notFound()
    }

    spacePages = await listPagesBySpaceKey(space.entityKey)
  } catch (error) {
    const message = formatReadError(error)
    return (
      <div className="card stack">
        <h1 className="title">Space temporarily unavailable</h1>
        <p className="notice">Could not load space for page creation: {message}</p>
      </div>
    )
  }

  if (!space) {
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
          { label: 'Create Page' }
        ]}
      />
      <CreatePageForm
        spaceKey={space.entityKey}
        spaceSlug={spaceSlug}
        spaceOwner={space.owner}
        availableParents={spacePages}
        viewer={viewer}
      />
    </section>
  )
}
