'use client'

import { useId, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  hasGitBookMarkdownSyntax,
  normalizeGitBookMarkdown,
  summarizeGitBookNormalization
} from '@/features/migration/gitbook-markdown'

export type MarkdownEditorFieldProps = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
}

export function MarkdownEditorField({ value, onChange, readOnly = false, placeholder }: MarkdownEditorFieldProps) {
  const textareaId = useId()

  return (
    <div className="stack" style={{ gap: '0.35rem' }}>
      <label htmlFor={textareaId}>Markdown body</label>
      <MarkdownTabs value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} textareaId={textareaId} />
    </div>
  )
}

type MarkdownTabsProps = {
  value: string
  onChange: (value: string) => void
  readOnly: boolean
  placeholder?: string
  textareaId: string
}

function MarkdownTabs({ value, onChange, readOnly, placeholder, textareaId }: MarkdownTabsProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [migrationFeedback, setMigrationFeedback] = useState<string>('')
  const previewMarkdown = useMemo(() => normalizeGitBookMarkdown(value).markdown, [value])
  const hasGitBookSyntax = useMemo(() => hasGitBookMarkdownSyntax(value), [value])

  function normalizeGitBookInput() {
    const result = normalizeGitBookMarkdown(value)
    onChange(result.markdown)

    if (!result.changed) {
      setMigrationFeedback('No GitBook-specific syntax detected.')
      return
    }

    const summary = summarizeGitBookNormalization(result.summary)
    setMigrationFeedback(
      summary.length > 0 ? `GitBook normalization applied (${summary.join('; ')}).` : 'GitBook normalization applied.'
    )
  }

  return (
    <div className="stack" style={{ gap: '0.55rem' }}>
      <div className="toolbar markdown-tabs">
        <button
          type="button"
          className={mode === 'edit' ? '' : 'secondary'}
          onClick={() => setMode('edit')}
          aria-pressed={mode === 'edit'}
        >
          Edit
        </button>
        <button
          type="button"
          className={mode === 'preview' ? '' : 'secondary'}
          onClick={() => setMode('preview')}
          aria-pressed={mode === 'preview'}
        >
          Preview
        </button>
        {!readOnly ? (
          <button type="button" className="secondary" onClick={normalizeGitBookInput}>
            Normalize GitBook Markdown
          </button>
        ) : null}
        {!readOnly && hasGitBookSyntax ? <span className="badge">GitBook syntax detected</span> : null}
      </div>

      {migrationFeedback ? <p className="subtitle">{migrationFeedback}</p> : null}

      {mode === 'edit' ? (
        <textarea
          id={textareaId}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      ) : (
        <div className="markdown-preview markdown doc-reader">
          {previewMarkdown.trim().length > 0 ? (
            <Markdown remarkPlugins={[remarkGfm]}>{previewMarkdown}</Markdown>
          ) : (
            <p className="subtitle">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
