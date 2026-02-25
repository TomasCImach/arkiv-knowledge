import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditPageForm } from '@/app/_components/edit-page-form'
import { getPageBySlug, getSpaceBySlug, listPagesBySpace } from '@/arkiv/queries'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function EditPageRoute({ params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }) {
  const { spaceSlug, pageSlug } = await params

  let space
  let page
  let spacePages = []

  try {
    ;[space, page, spacePages] = await Promise.all([
      getSpaceBySlug(spaceSlug),
      getPageBySlug(spaceSlug, pageSlug),
      listPagesBySpace(spaceSlug)
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

  return (
    <section className="stack doc-column">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Knowledge Base' },
          { href: `/spaces/${spaceSlug}`, label: space.payload.name },
          { href: `/spaces/${spaceSlug}/${pageSlug}`, label: page.payload.title },
          { label: 'Edit' }
        ]}
      />
      <EditPageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} page={page} availableParents={spacePages} />
    </section>
  )
}
