'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main style={{ padding: '1rem', maxWidth: '820px', margin: '0 auto' }}>
          <section className="card stack route-state error">
            <span className="route-state-eyebrow">Global error</span>
            <h1 className="route-state-title">Application error</h1>
            <p className="subtitle">{error.message}</p>
            <div className="toolbar route-state-actions">
              <button type="button" className="button secondary" onClick={() => reset()}>
                Reload app
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
