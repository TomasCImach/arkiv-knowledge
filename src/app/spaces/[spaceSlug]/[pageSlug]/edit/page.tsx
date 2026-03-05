import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { EditPageForm } from '@/app/_components/edit-page-form'
import { PageLifecycleForm } from '@/app/_components/page-lifecycle-form'
import { RetryButton } from '@/app/_components/retry-button'
import { RouteStateCard, RouteStateLinkAction } from '@/app/_components/route-state-card'
import { TechnicalDetails } from '@/app/_components/technical-details'
import { TransferOwnershipForm } from '@/app/_components/transfer-ownership-form'
import { getPageBySlugInSpace, getSpaceBySlug, listPagesBySpaceKey } from '@/arkiv/queries'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'
import { equalAddress } from '@/features/ownership/permissions'
import { canViewSpace } from '@/features/visibility/access'
import { formatReadError } from '@/lib/wallet'

export const dynamic = 'force-dynamic'

export default async function EditPageRoute({
  params,
  searchParams: _
}: {
  params: Promise<{ spaceSlug: string; pageSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { spaceSlug, pageSlug } = await params

  let space
  let page
  let spacePages = []

  try {
    space = await getSpaceBySlug(spaceSlug)
    if (!space) {
      notFound()
    }

    ;[page, spacePages] = await Promise.all([
      getPageBySlugInSpace(space.entityKey, pageSlug),
      listPagesBySpaceKey(space.entityKey)
    ])
  } catch (error) {
    const message = formatReadError(error)
    return (
      <section className="stack doc-column">
        <RouteStateCard
          tone="error"
          title="Cannot load edit-page context"
          message={`Could not load page for editing: ${message}`}
          action={
            <>
              <RetryButton label="Retry edit-page context" />
              <RouteStateLinkAction href={`/spaces/${spaceSlug}/${pageSlug}`} label="Back to page" secondary />
            </>
          }
        />
      </section>
    )
  }

  if (!space || !page) {
    notFound()
  }
  const viewer = await getAuthenticatedViewerAddress()
  if (!canViewSpace(space, viewer)) {
    notFound()
  }
  const isVerifiedOwner = equalAddress(page.owner, viewer)

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
      {isVerifiedOwner ? (
        <>
          <PageLifecycleForm page={page} viewer={viewer} />
          <div className="card stack">
            <h3 style={{ margin: 0 }}>Transfer Page Ownership</h3>
            <p className="subtitle">Transfer this page to another wallet.</p>
            <TechnicalDetails summary="Technical details (ownership transfer)">
              <p className="subtitle">This action updates canonical `kb.page` ownership using Arkiv `changeOwnership`.</p>
            </TechnicalDetails>
            <TransferOwnershipForm entityKey={page.entityKey} entityOwner={page.owner} entityLabel="page" />
          </div>
        </>
      ) : (
        <RouteStateCard
          title="Owner tools hidden"
          message="Connect the owner wallet and verify private access to use lifecycle and ownership controls."
        />
      )}
    </section>
  )
}
