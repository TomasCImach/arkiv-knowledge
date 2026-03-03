'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card stack route-state error">
      <span className="route-state-eyebrow">Route error</span>
      <h2 className="route-state-title">Something went wrong</h2>
      <p className="subtitle">{error.message}</p>
      <div className="toolbar route-state-actions">
        <button type="button" className="button secondary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  )
}
