import { RouteLoadingState } from '@/app/_components/route-loading-state'

export default function Loading() {
  return (
    <section className="stack doc-column">
      <RouteLoadingState title="Loading space settings" message="Loading owner settings and transfer controls from Arkiv..." />
    </section>
  )
}
