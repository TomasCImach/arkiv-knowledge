'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main style={{ padding: '2rem' }}>
          <h1>Application error</h1>
          <p>{error.message}</p>
          <button type="button" onClick={() => reset()}>
            Reload
          </button>
        </main>
      </body>
    </html>
  )
}
