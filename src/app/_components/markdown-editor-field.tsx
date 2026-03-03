'use client'

import { useId, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      </div>

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
          {value.trim().length > 0 ? <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown> : <p className="subtitle">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  )
}
