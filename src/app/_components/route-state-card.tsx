import Link from 'next/link'
import type { ReactNode } from 'react'

type RouteStateTone = 'empty' | 'error' | 'loading'

type RouteStateCardProps = {
  title: string
  message: string
  tone?: RouteStateTone
  action?: ReactNode
  children?: ReactNode
}

export function RouteStateCard({ title, message, tone = 'empty', action, children }: RouteStateCardProps) {
  return (
    <div className={`card stack route-state ${tone}`}>
      <span className="route-state-eyebrow">{tone === 'error' ? 'Read issue' : tone === 'loading' ? 'Loading' : 'Empty state'}</span>
      <h2 className="route-state-title">{title}</h2>
      <p className="subtitle">{message}</p>
      {children}
      {action ? <div className="toolbar route-state-actions">{action}</div> : null}
    </div>
  )
}

export function RouteStateLinkAction({ href, label, secondary = false }: { href: string; label: string; secondary?: boolean }) {
  return (
    <Link href={href} className={secondary ? 'button secondary' : 'button'}>
      {label}
    </Link>
  )
}
