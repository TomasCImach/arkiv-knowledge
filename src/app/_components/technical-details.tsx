import type { ReactNode } from 'react'

type TechnicalDetailsProps = {
  summary?: string
  children: ReactNode
}

export function TechnicalDetails({ summary = 'Technical details', children }: TechnicalDetailsProps) {
  return (
    <details className="technical-details">
      <summary className="technical-summary">{summary}</summary>
      <div className="technical-body">{children}</div>
    </details>
  )
}
