import { RouteStateCard } from '@/app/_components/route-state-card'

export function RouteLoadingState({
  title = 'Loading content',
  message = 'Fetching the latest Arkiv entities...'
}: {
  title?: string
  message?: string
}) {
  return (
    <RouteStateCard title={title} message={message} tone="loading">
      <div className="loading-skeleton-block" aria-hidden>
        <span className="loading-skeleton-line long" />
        <span className="loading-skeleton-line medium" />
        <span className="loading-skeleton-line short" />
      </div>
    </RouteStateCard>
  )
}
