import { notFound } from 'next/navigation'
import { CreatePageForm } from '@/app/_components/create-page-form'
import { getSpaceBySlug } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function NewPageRoute({ params }: { params: Promise<{ spaceSlug: string }> }) {
  const { spaceSlug } = await params
  const space = await getSpaceBySlug(spaceSlug)

  if (!space) {
    notFound()
  }

  return <CreatePageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} />
}
