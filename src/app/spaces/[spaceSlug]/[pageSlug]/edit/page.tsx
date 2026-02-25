import { notFound } from 'next/navigation'
import { EditPageForm } from '@/app/_components/edit-page-form'
import { getPageBySlug, getSpaceBySlug } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function EditPageRoute({ params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }) {
  const { spaceSlug, pageSlug } = await params

  let space
  let page

  try {
    ;[space, page] = await Promise.all([getSpaceBySlug(spaceSlug), getPageBySlug(spaceSlug, pageSlug)])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Arkiv RPC error'
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

  return <EditPageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} page={page} />
}
