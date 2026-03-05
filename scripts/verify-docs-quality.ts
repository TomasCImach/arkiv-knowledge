import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

type Severity = 'error' | 'warning'

type Issue = {
  severity: Severity
  code: string
  file: string
  message: string
  line?: number
  detail?: string
}

type RequiredDocSpec = {
  file: string
  headings: string[]
}

type Report = {
  generatedAt: string
  rootPath: string
  summary: {
    errors: number
    warnings: number
    filesScanned: number
  }
  issues: Issue[]
}

const requiredDocs: RequiredDocSpec[] = [
  {
    file: 'docs/README.md',
    headings: ['Purpose', 'Doc index', 'How to use before submission']
  },
  {
    file: 'CONTRIBUTING.md',
    headings: ['Prerequisites', 'Local workflow', 'PR checklist', 'Verification matrix', 'Definition of done']
  },
  {
    file: 'docs/ARCHITECTURE.md',
    headings: [
      'System context',
      'Data flow (read/write/agent/presence)',
      'Directory responsibilities',
      'Boundary rules',
      'Current hotspots'
    ]
  },
  {
    file: 'docs/SECURITY_MODEL.md',
    headings: ['Trust boundaries', 'Auth model', 'Ownership enforcement', 'Threats mitigated', 'Known limitations']
  },
  {
    file: 'docs/QUALITY_STANDARDS.md',
    headings: [
      'TypeScript standards',
      'Testing taxonomy',
      'Error handling conventions',
      'Observability/logging rules',
      'Review checklist'
    ]
  },
  {
    file: 'docs/RUBRIC_QUALITY_MAP.md',
    headings: ['README mapping', 'Code organization mapping', 'Code quality mapping', 'Evidence commands']
  }
]

const submissionFacingDocs = [
  'README.md',
  'SUBMISSION_EVIDENCE.md',
  'DEMO_SCRIPT.md',
  'PLAN.md',
  'EXPLANATIONS.md',
  'ITERATION_LOG.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/ARCHITECTURE.md',
  'docs/SECURITY_MODEL.md',
  'docs/QUALITY_STANDARDS.md',
  'docs/RUBRIC_QUALITY_MAP.md'
]

type CliOptions = {
  rootPath: string
  reportPath: string
}

function parseCliOptions(args: string[]): CliOptions {
  const defaults: CliOptions = {
    rootPath: process.cwd(),
    reportPath: 'output/docs-quality/report.json'
  }

  let index = 0
  while (index < args.length) {
    const arg = args[index]
    if (arg === '--root') {
      const value = args[index + 1]
      if (value) {
        defaults.rootPath = path.resolve(value)
      }
      index += 2
      continue
    }
    if (arg === '--report') {
      const value = args[index + 1]
      if (value) {
        defaults.reportPath = value
      }
      index += 2
      continue
    }
    index += 1
  }

  return defaults
}

function normalizeHeading(value: string): string {
  return value.trim().toLowerCase()
}

function listHeadings(markdown: string): string[] {
  const headings: string[] = []
  for (const line of markdown.split('\n')) {
    const match = /^#{1,6}\s+(.+?)\s*$/.exec(line)
    if (match && match[1]) {
      headings.push(normalizeHeading(match[1]))
    }
  }
  return headings
}

function findLineNumber(text: string, pattern: RegExp): number | undefined {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i] ?? '')) {
      return i + 1
    }
  }
  return undefined
}

function parseLocalLinks(markdown: string): string[] {
  const links: string[] = []
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g

  for (const match of markdown.matchAll(pattern)) {
    const rawTarget = (match[1] ?? '').trim()
    if (!rawTarget) {
      continue
    }
    links.push(rawTarget)
  }

  return links
}

function cleanLinkTarget(target: string): string {
  const unwrapped = target.replace(/^<|>$/g, '')
  const noHash = unwrapped.split('#')[0] ?? ''
  const noQuery = noHash.split('?')[0] ?? ''
  return noQuery.trim()
}

function isExternalLink(target: string): boolean {
  const value = target.toLowerCase()
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('data:') ||
    value.startsWith('javascript:')
  )
}

function resolveLinkTarget(rootPath: string, sourceFile: string, target: string): string {
  if (path.isAbsolute(target)) {
    return target
  }

  return path.resolve(path.dirname(path.resolve(rootPath, sourceFile)), target)
}

function toRepoRelative(rootPath: string, absolutePath: string): string {
  const relative = path.relative(rootPath, absolutePath)
  if (!relative || relative === '') {
    return '.'
  }
  return relative.split(path.sep).join('/')
}

function runChecks(options: CliOptions): Report {
  const rootPath = options.rootPath
  const issues: Issue[] = []
  let filesScanned = 0

  const readableDocs = new Map<string, string>()

  for (const requiredDoc of requiredDocs) {
    const absolutePath = path.resolve(rootPath, requiredDoc.file)
    if (!existsSync(absolutePath)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_FILE',
        file: requiredDoc.file,
        message: `Required file is missing: ${requiredDoc.file}`
      })
      continue
    }

    const markdown = readFileSync(absolutePath, 'utf8')
    readableDocs.set(requiredDoc.file, markdown)
    filesScanned += 1

    const headings = listHeadings(markdown)
    for (const heading of requiredDoc.headings) {
      if (!headings.includes(normalizeHeading(heading))) {
        issues.push({
          severity: 'error',
          code: 'MISSING_HEADING',
          file: requiredDoc.file,
          message: `Missing required heading "${heading}" in ${requiredDoc.file}`
        })
      }
    }
  }

  for (const docFile of submissionFacingDocs) {
    const absolutePath = path.resolve(rootPath, docFile)
    if (!existsSync(absolutePath)) {
      issues.push({
        severity: 'warning',
        code: 'DOC_NOT_FOUND',
        file: docFile,
        message: `Submission-facing doc not found for placeholder/link scan: ${docFile}`
      })
      continue
    }

    const markdown = readableDocs.get(docFile) ?? readFileSync(absolutePath, 'utf8')
    if (!readableDocs.has(docFile)) {
      filesScanned += 1
    }

    const placeholderMatches = Array.from(markdown.matchAll(/\b(TBD|TODO|WIP)\b/g))
    for (const match of placeholderMatches) {
      const token = match[1] ?? 'placeholder'
      const line = findLineNumber(markdown, new RegExp(`\\b${token}\\b`))
      issues.push({
        severity: 'warning',
        code: 'PLACEHOLDER_TOKEN',
        file: docFile,
        message: `Found placeholder token "${token}" in ${docFile}`,
        line
      })
    }

    const links = parseLocalLinks(markdown)
    for (const rawLink of links) {
      const normalized = cleanLinkTarget(rawLink)
      if (!normalized || normalized.startsWith('#') || isExternalLink(normalized)) {
        continue
      }

      const resolved = resolveLinkTarget(rootPath, docFile, normalized)
      if (!existsSync(resolved)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_LOCAL_LINK',
          file: docFile,
          message: `Broken local markdown link in ${docFile}: ${rawLink}`,
          detail: toRepoRelative(rootPath, resolved)
        })
      }
    }
  }

  const errors = issues.filter((item) => item.severity === 'error').length
  const warnings = issues.filter((item) => item.severity === 'warning').length

  return {
    generatedAt: new Date().toISOString(),
    rootPath,
    summary: {
      errors,
      warnings,
      filesScanned
    },
    issues
  }
}

function writeReport(rootPath: string, reportPath: string, report: Report): string {
  const absoluteReportPath = path.resolve(rootPath, reportPath)
  mkdirSync(path.dirname(absoluteReportPath), { recursive: true })
  writeFileSync(absoluteReportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return absoluteReportPath
}

function main() {
  const options = parseCliOptions(process.argv.slice(2))
  const report = runChecks(options)
  const reportPath = writeReport(options.rootPath, options.reportPath, report)

  console.log(
    `Docs quality report generated: ${reportPath} (errors=${report.summary.errors}, warnings=${report.summary.warnings}, filesScanned=${report.summary.filesScanned})`
  )
}

try {
  main()
} catch (error) {
  console.error('verify-docs-quality failed unexpectedly')
  console.error(error)
  process.exit(1)
}
