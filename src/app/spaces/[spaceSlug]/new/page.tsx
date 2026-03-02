import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { CreatePageForm } from '@/app/_components/create-page-form'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { getSpaceBySlug, listPagesBySpaceKey } from '@/arkiv/queries'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { canViewSpace } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function NewPageRoute({
  params,
  searchParams: _
}: {
  params: Promise<{ spaceSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { spaceSlug } = await params
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
      <section className="stack doc-column">
        <RouteStateCard
          tone="error"
          title="Cannot load create-page context"
          message={`Could not load space for page creation: ${message}`}
          action={
            <>
              <RetryButton label="Retry create-page context" />
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
          { label: 'Create Page' }
        ]}
      />
      <CreatePageForm spaceKey={space.entityKey} spaceSlug={spaceSlug} spaceOwner={space.owner} availableParents={spacePages} />
    </section>
  )
}
