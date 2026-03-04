import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { normalizeGitBookMarkdown, summarizeGitBookNormalization } from '@/features/migration/gitbook-markdown'

function printUsage() {
  console.error('Usage: pnpm migrate:gitbook -- <input.md> [output.md] [--summary]')
}

async function main() {
  const args = process.argv.slice(2)
  const showSummary = args.includes('--summary')
  const positional = args.filter((arg) => !arg.startsWith('--'))

  if (positional.length < 1 || positional.length > 2) {
    printUsage()
    process.exit(1)
  }

  const inputPath = path.resolve(process.cwd(), positional[0])
  const outputPath = positional[1] ? path.resolve(process.cwd(), positional[1]) : undefined

  const sourceMarkdown = await readFile(inputPath, 'utf8')
  const conversion = normalizeGitBookMarkdown(sourceMarkdown)

  if (outputPath) {
    await writeFile(outputPath, conversion.markdown, 'utf8')
    console.error(`Converted markdown written to ${outputPath}`)
  } else {
    process.stdout.write(conversion.markdown)
    if (!conversion.markdown.endsWith('\n')) {
      process.stdout.write('\n')
    }
  }

  if (showSummary) {
    const summary = summarizeGitBookNormalization(conversion.summary)
    if (summary.length === 0) {
      console.error('No GitBook-specific syntax detected.')
    } else {
      console.error(`Transforms applied: ${summary.join('; ')}`)
    }
  }
}

main().catch((error) => {
  console.error('GitBook migration failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
