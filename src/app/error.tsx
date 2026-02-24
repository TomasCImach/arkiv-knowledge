'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card stack">
      <h2 className="title">Something went wrong</h2>
      <p className="subtitle">{error.message}</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
