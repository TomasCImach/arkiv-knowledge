import { notFound } from 'next/navigation'
import { CreatePageForm } from '@/app/_components/create-page-form'
import { getSpaceBySlug } from '@/arkiv/queries'

export const dynamic = 'force-dynamic'

export default async function NewPageRoute({ params }: { params: Promise<{ spaceSlug: string }> }) {
  const { spaceSlug } = await params
  let space

  try {
    space = await getSpaceBySlug(spaceSlug)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Arkiv RPC error'
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

  return <CreatePageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} />
}
