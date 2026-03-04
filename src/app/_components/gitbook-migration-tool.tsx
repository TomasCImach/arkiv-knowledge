'use client'

import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeGitBookMarkdown, summarizeGitBookNormalization } from '@/features/migration/gitbook-markdown'

const SAMPLE_GITBOOK_MARKDOWN = `---
description: >-
  This page was migrated from GitBook and keeps links/code intact.
---
# Migration sample

<a href="#overview" id="overview"></a>
## Overview

{% embed url="https://example.com/docs/video" %}

{% code title="app.ts" lineNumbers="true" %}
\`\`\`ts
console.log('hello from gitbook')
\`\`\`
{% endcode %}
`

export function GitBookMigrationTool() {
  const [sourceMarkdown, setSourceMarkdown] = useState('')
  const conversion = useMemo(() => normalizeGitBookMarkdown(sourceMarkdown), [sourceMarkdown])
  const summary = useMemo(() => summarizeGitBookNormalization(conversion.summary), [conversion.summary])
  const hasInput = sourceMarkdown.trim().length > 0

  return (
    <div className="stack">
      <div className="card stack">
        <h2 style={{ margin: 0 }}>GitBook Markdown Converter</h2>
        <p className="subtitle">
          Paste exported GitBook markdown and get Arkiv-compatible markdown instantly. Existing GitBook wrappers are normalized.
        </p>
        <div className="toolbar">
          <button type="button" className="secondary" onClick={() => setSourceMarkdown(SAMPLE_GITBOOK_MARKDOWN)}>
            Load sample input
          </button>
          <button type="button" className="secondary" onClick={() => setSourceMarkdown('')} disabled={!hasInput}>
            Clear input
          </button>
        </div>
      </div>

      <div className="migration-grid">
        <div className="card stack">
          <label>
            GitBook markdown input
            <textarea
              value={sourceMarkdown}
              onChange={(event) => setSourceMarkdown(event.target.value)}
              placeholder="Paste GitBook markdown here..."
              aria-label="GitBook markdown input"
            />
          </label>
        </div>

        <div className="card stack">
          <label>
            Converted markdown
            <textarea
              value={conversion.markdown}
              readOnly
              placeholder="Converted markdown will appear here."
              aria-label="Converted markdown"
            />
          </label>
        </div>
      </div>

      {hasInput ? (
        summary.length > 0 ? (
          <div className="notice stack" style={{ gap: '0.55rem' }}>
            <strong>Transforms applied</strong>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="subtitle">No GitBook-specific syntax detected. Converted markdown matches the input.</p>
        )
      ) : null}

      {conversion.markdown.trim().length > 0 ? (
        <div className="card stack">
          <h2 style={{ margin: 0 }}>Converted Preview</h2>
          <div className="markdown-preview markdown doc-reader">
            <Markdown remarkPlugins={[remarkGfm]}>{conversion.markdown}</Markdown>
          </div>
        </div>
      ) : null}
    </div>
  )
}
