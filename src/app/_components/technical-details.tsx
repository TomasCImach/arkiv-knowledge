import type { ReactNode } from 'react'
import { isTechnicalDetailsUiEnabled } from '@/lib/ui-flags'

type TechnicalDetailsProps = {
  summary?: string
  children: ReactNode
}

export function TechnicalDetails({ summary = 'Technical details', children }: TechnicalDetailsProps) {
  if (!isTechnicalDetailsUiEnabled()) {
    return null
  }

  return (
    <details className="technical-details">
      <summary className="technical-summary">{summary}</summary>
      <div className="technical-body">{children}</div>
    </details>
  )
}
