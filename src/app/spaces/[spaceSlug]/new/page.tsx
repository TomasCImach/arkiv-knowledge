import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { CreatePageForm } from '@/app/_components/create-page-form'
import { getSpaceBySlug, listPagesBySpace } from '@/arkiv/queries'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function NewPageRoute({ params }: { params: Promise<{ spaceSlug: string }> }) {
  const { spaceSlug } = await params
  let space
  let spacePages = []

  try {
    ;[space, spacePages] = await Promise.all([getSpaceBySlug(spaceSlug), listPagesBySpace(spaceSlug)])
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

  return (
    <section className="stack doc-column">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Knowledge Base' },
          { href: `/spaces/${spaceSlug}`, label: space.payload.name },
          { label: 'Create Page' }
        ]}
      />
      <CreatePageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} spaceOwner={space.owner} availableParents={spacePages} />
    </section>
  )
}
