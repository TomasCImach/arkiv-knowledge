import { RouteLoadingState } from '@/app/_components/route-loading-state'

export default function Loading() {
  return (
    <section className="stack doc-column">
      <RouteLoadingState
        title="Loading page"
        message="Hydrating canonical page, revisions, backlinks, and presence panels from Arkiv..."
      />
    </section>
  )
}
