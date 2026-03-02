import { RouteLoadingState } from '@/app/_components/route-loading-state'

export default function Loading() {
  return (
    <section className="stack doc-column">
      <RouteLoadingState title="Loading knowledge base" message="Fetching the latest spaces and navigation data from Arkiv..." />
    </section>
  )
}
