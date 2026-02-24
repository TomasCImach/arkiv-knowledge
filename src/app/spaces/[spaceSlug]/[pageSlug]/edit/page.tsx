import { notFound } from 'next/navigation'
import { EditPageForm } from '@/app/_components/edit-page-form'
import { getPageBySlug, getSpaceBySlug } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function EditPageRoute({ params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }) {
  const { spaceSlug, pageSlug } = await params

  const [space, page] = await Promise.all([getSpaceBySlug(spaceSlug), getPageBySlug(spaceSlug, pageSlug)])

  if (!space || !page) {
    notFound()
  }

  return <EditPageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} page={page} />
}
