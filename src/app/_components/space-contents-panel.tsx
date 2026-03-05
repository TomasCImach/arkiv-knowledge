'use client'

import Link from 'next/link'
import { useState } from 'react'

export type SpaceContentsPanelSection = {
  id: string
  title: string
  href: string
  children: Array<{
    id: string
    title: string
    href: string
  }>
}

type SpaceContentsPanelProps = {
  sections: SpaceContentsPanelSection[]
  initialExpandedId?: string
}

export function SpaceContentsPanel({ sections, initialExpandedId }: SpaceContentsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>(initialExpandedId)

  function toggleSection(sectionId: string) {
    setExpandedId((current) => (current === sectionId ? undefined : sectionId))
  }

  return (
    <div className="space-contents-groups">
      {sections.map((section) => {
        const expanded = expandedId === section.id

        return (
          <section key={section.id} className={`space-contents-group ${expanded ? 'expanded' : ''}`}>
            <div className="space-contents-group-row">
              <Link href={section.href} className="space-contents-group-link">
                {section.title}
              </Link>
              {section.children.length > 0 ? (
                <button
                  type="button"
                  className="space-contents-chevron-toggle"
                  aria-expanded={expanded}
                  aria-controls={`space-contents-section-${section.id}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="material-symbols-outlined space-contents-chevron" aria-hidden>
                    {expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                  </span>
                </button>
              ) : null}
            </div>

            {expanded && section.children.length > 0 ? (
              <div id={`space-contents-section-${section.id}`} className="space-contents-children">
                {section.children.map((entry, index) => (
                  <Link key={entry.id} href={entry.href} className={`space-contents-child-link ${index === 0 ? 'is-active' : ''}`}>
                    {entry.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
