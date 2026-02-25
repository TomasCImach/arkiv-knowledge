import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditSpaceForm } from '@/app/_components/edit-space-form'
import { getSpaceBySlug } from '@/arkiv/queries'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function SpaceSettingsRoute({ params }: { params: Promise<{ spaceSlug: string }> }) {
  const { spaceSlug } = await params
  let space

  try {
    space = await getSpaceBySlug(spaceSlug)
  } catch (error) {
    const message = formatReadError(error)
    return (
      <div className="card stack">
        <h1 className="title">Space temporarily unavailable</h1>
        <p className="notice">Could not load space settings from Arkiv: {message}</p>
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
          { label: 'Settings' }
        ]}
      />
      <EditSpaceForm space={space} />
    </section>
  )
}
