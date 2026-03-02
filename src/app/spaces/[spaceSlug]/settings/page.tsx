import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditSpaceForm } from '@/app/_components/edit-space-form'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { TechnicalDetails } from '@/app/_components/technical-details'
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
      <section className="stack doc-column">
        <RouteStateCard
          tone="error"
          title="Space settings unavailable"
          message={`Could not load space settings from Arkiv: ${message}`}
          action={
            <>
              <RetryButton label="Retry settings read" />
              <RouteStateLinkAction href={`/spaces/${spaceSlug}`} label="Back to space" secondary />
            </>
          }
        />
      </section>
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
        <p className="subtitle">Transfer this space to another wallet.</p>
        <TechnicalDetails summary="Technical details (ownership transfer)">
          <p className="subtitle">Only the current owner can transfer canonical `kb.space` ownership via Arkiv `changeOwnership`.</p>
        </TechnicalDetails>
        <TransferOwnershipForm entityKey={space.entityKey} entityOwner={space.owner} entityLabel="space" />
      </div>
    </section>
  )
}
