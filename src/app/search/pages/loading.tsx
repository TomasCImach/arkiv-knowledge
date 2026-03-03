import { RouteLoadingState } from '@/app/_components/route-loading-state'

export default function Loading() {
  return (
    <section className="stack doc-column">
      <RouteLoadingState title="Loading cross-space search" message="Preparing query controls and loading searchable pages..." />
    </section>
  )
}
