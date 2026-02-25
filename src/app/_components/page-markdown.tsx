import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function PageMarkdown({ markdown }: { markdown: string }) {
  return (
    <article className="card markdown doc-reader">
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </article>
  )
}
