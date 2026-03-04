import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeGitBookMarkdown } from '@/features/migration/gitbook-markdown'

export function PageMarkdown({ markdown }: { markdown: string }) {
  const normalizedMarkdown = normalizeGitBookMarkdown(markdown).markdown

  return (
    <article className="card markdown doc-reader">
      <Markdown remarkPlugins={[remarkGfm]}>{normalizedMarkdown}</Markdown>
    </article>
  )
}
