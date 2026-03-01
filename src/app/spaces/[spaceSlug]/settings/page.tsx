import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditSpaceForm } from '@/app/_components/edit-space-form'
import { TransferOwnershipForm } from '@/app/_components/transfer-ownership-form'
import { getSpaceBySlug } from '@/arkiv/queries'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { canViewSpace } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function SpaceSettingsRoute({
  params,
  searchParams: _
}: {
  params: Promise<{ spaceSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
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
  const viewer = await getAuthenticatedViewerAddress()
  if (!canViewSpace(space, viewer)) {
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
      <div className="card stack">
        <h2 style={{ margin: 0 }}>Transfer Space Ownership</h2>
        <p className="subtitle">Only current owner can transfer this canonical `kb.space` entity to another wallet.</p>
        <TransferOwnershipForm entityKey={space.entityKey} entityOwner={space.owner} entityLabel="space" />
      </div>
    </section>
  )
}
