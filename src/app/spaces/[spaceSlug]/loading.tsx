import { RouteLoadingState } from '@/app/_components/route-loading-state'

export default function Loading() {
  return (
    <section className="stack doc-column">
      <RouteLoadingState title="Loading space" message="Fetching space metadata, hierarchy, and page index from Arkiv..." />
    </section>
  )
}
