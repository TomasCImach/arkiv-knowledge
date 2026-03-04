export type GitBookNormalizationSummary = {
  frontmatterBlocksRemoved: number
  descriptionCalloutsAdded: number
  embedBlocksConverted: number
  figureBlocksConverted: number
  pictureBlocksConverted: number
  hintBlocksConverted: number
  stepperBlocksConverted: number
  stepsConverted: number
  codeWrappersRemoved: number
  anchorTagsRemoved: number
}

export type GitBookNormalizationResult = {
  markdown: string
  summary: GitBookNormalizationSummary
  changed: boolean
}

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/
const GITBOOK_EMBED_REGEX = /\{%\s*embed\s+([^%]+)\s*%\}/gi
const GITBOOK_FIGURE_REGEX = /<figure>\s*<img\b([^>]*)>\s*(?:<figcaption>\s*<p>([\s\S]*?)<\/p>\s*<\/figcaption>)?\s*<\/figure>/gi
const GITBOOK_PICTURE_REGEX = /<picture>\s*[\s\S]*?<img\b([^>]*)>\s*[\s\S]*?<\/picture>/gi
const GITBOOK_HINT_REGEX = /\{%\s*hint\s*([^%]*)%\}([\s\S]*?)\{%\s*endhint\s*%\}/gi
const GITBOOK_STEPPER_REGEX = /\{%\s*stepper\s*%\}([\s\S]*?)\{%\s*endstepper\s*%\}/gi
const GITBOOK_STEP_REGEX = /\{%\s*step\s*%\}([\s\S]*?)\{%\s*endstep\s*%\}/gi
const GITBOOK_CODE_WRAPPER_REGEX = /^\s*\{%\s*(?:end)?code\b[^%]*%\}\s*$/gim
const GITBOOK_ANCHOR_TAG_REGEX = /<a\b[^>]*\bid=(['"])[^'"]+\1[^>]*>\s*<\/a>/gi
const GITBOOK_EMBED_DETECT_REGEX = /\{%\s*embed\s+[^%]+\s*%\}/i
const GITBOOK_FIGURE_DETECT_REGEX = /<figure>\s*<img\b[^>]*>\s*(?:<figcaption>\s*<p>[\s\S]*?<\/p>\s*<\/figcaption>)?\s*<\/figure>/i
const GITBOOK_PICTURE_DETECT_REGEX = /<picture>\s*[\s\S]*?<img\b[^>]*>[\s\S]*?<\/picture>/i
const GITBOOK_HINT_DETECT_REGEX = /\{%\s*hint\s*[^%]*%\}[\s\S]*?\{%\s*endhint\s*%\}/i
const GITBOOK_STEPPER_DETECT_REGEX = /\{%\s*stepper\s*%\}[\s\S]*?\{%\s*endstepper\s*%\}/i
const GITBOOK_STEP_DETECT_REGEX = /\{%\s*step\s*%\}[\s\S]*?\{%\s*endstep\s*%\}/i
const GITBOOK_CODE_WRAPPER_DETECT_REGEX = /\{%\s*(?:end)?code\b[^%]*%\}/i
const GITBOOK_ANCHOR_TAG_DETECT_REGEX = /<a\b[^>]*\bid=(['"])[^'"]+\1[^>]*>\s*<\/a>/i

function emptySummary(): GitBookNormalizationSummary {
  return {
    frontmatterBlocksRemoved: 0,
    descriptionCalloutsAdded: 0,
    embedBlocksConverted: 0,
    figureBlocksConverted: 0,
    pictureBlocksConverted: 0,
    hintBlocksConverted: 0,
    stepperBlocksConverted: 0,
    stepsConverted: 0,
    codeWrappersRemoved: 0,
    anchorTagsRemoved: 0
  }
}

function stripWrappingQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }

  return value
}

function foldYamlBlock(lines: string[]): string {
  const paragraphs: string[] = []
  let currentParagraph: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '))
        currentParagraph = []
      }
      continue
    }

    currentParagraph.push(trimmed)
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '))
  }

  return paragraphs.join('\n').trim()
}

function literalYamlBlock(lines: string[]): string {
  return lines.map((line) => line.replace(/\s+$/g, '')).join('\n').trim()
}

function extractDescriptionFromFrontmatter(frontmatter: string): string | null {
  const lines = frontmatter.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = line.match(/^description:\s*(.*)$/)
    if (!match) {
      continue
    }

    const value = match[1].trim()
    if (!value) {
      return ''
    }

    if (value === '>' || value === '>-' || value === '|' || value === '|-') {
      const isFolded = value.startsWith('>')
      const blockLines: string[] = []
      let cursor = index + 1

      while (cursor < lines.length) {
        const candidate = lines[cursor]
        if (candidate.startsWith('  ')) {
          blockLines.push(candidate.slice(2))
          cursor += 1
          continue
        }

        if (candidate.trim().length === 0 && blockLines.length > 0) {
          blockLines.push('')
          cursor += 1
          continue
        }

        break
      }

      return isFolded ? foldYamlBlock(blockLines) : literalYamlBlock(blockLines)
    }

    return stripWrappingQuotes(value)
  }

  return null
}

function descriptionToBlockquote(description: string): string {
  const lines = description.split('\n')
  return lines
    .map((line, index) => {
      if (index === 0) {
        return `> **Description:** ${line}`
      }
      return `> ${line}`
    })
    .join('\n')
}

function stripFrontmatter(markdown: string, summary: GitBookNormalizationSummary): string {
  const match = markdown.match(FRONTMATTER_REGEX)
  if (!match) {
    return markdown
  }

  summary.frontmatterBlocksRemoved += 1
  const description = extractDescriptionFromFrontmatter(match[1])
  const body = markdown.slice(match[0].length)

  if (!description || description.trim().length === 0) {
    return body
  }

  summary.descriptionCalloutsAdded += 1
  return `${descriptionToBlockquote(description.trim())}\n\n${body}`
}

function extractTagAttribute(attributes: string, name: string): string | null {
  const matcher = new RegExp(`${name}\\s*=\\s*(?:"([^"]+)"|'([^']+)')`, 'i')
  const match = matcher.exec(attributes)
  if (!match) {
    return null
  }

  return (match[1] ?? match[2] ?? '').trim()
}

function convertEmbeds(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_EMBED_REGEX, (fullMatch, attributes) => {
    const url = extractTagAttribute(attributes, 'url')
    if (!url) {
      return fullMatch
    }

    summary.embedBlocksConverted += 1
    const caption = extractTagAttribute(attributes, 'caption')
    const label = caption && caption.length > 0 ? caption.replace(/\]/g, '\\]') : 'Embedded content'
    return `[${label}](${url})`
  })
}

function sanitizeInlineMarkdown(value: string): string {
  return value.replace(/\s+/g, ' ').trim().replace(/]/g, '\\]')
}

function sanitizeCaption(value: string): string {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function convertFigures(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_FIGURE_REGEX, (fullMatch, imageAttributes, captionRaw: string | undefined) => {
    const src = extractTagAttribute(imageAttributes, 'src')
    if (!src) {
      return fullMatch
    }

    const altRaw = extractTagAttribute(imageAttributes, 'alt') ?? 'Imported image'
    const alt = sanitizeInlineMarkdown(altRaw)
    const caption = captionRaw ? sanitizeCaption(captionRaw) : ''

    summary.figureBlocksConverted += 1

    if (caption.length > 0) {
      return `![${alt}](${src})\n\n*${caption}*`
    }

    return `![${alt}](${src})`
  })
}

function convertPictures(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_PICTURE_REGEX, (fullMatch, imageAttributes) => {
    const src = extractTagAttribute(imageAttributes, 'src')
    if (!src) {
      return fullMatch
    }

    const altRaw = extractTagAttribute(imageAttributes, 'alt') ?? 'Imported image'
    const alt = sanitizeInlineMarkdown(altRaw)
    summary.pictureBlocksConverted += 1
    return `![${alt}](${src})`
  })
}

function normalizeLiquidBlockContent(value: string): string {
  return value.replace(/\r\n?/g, '\n').trim()
}

function hintStyleLabel(style: string): string {
  switch (style.toLowerCase()) {
    case 'info':
      return 'Info'
    case 'warning':
      return 'Warning'
    case 'danger':
      return 'Danger'
    case 'success':
      return 'Success'
    default:
      return 'Note'
  }
}

function convertHints(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_HINT_REGEX, (_fullMatch, attributes, blockContent: string) => {
    const style = extractTagAttribute(attributes, 'style') ?? 'note'
    const label = hintStyleLabel(style)
    const content = normalizeLiquidBlockContent(blockContent)
    const quotedBody =
      content.length > 0
        ? content
            .split('\n')
            .map((line) => (line.trim().length > 0 ? `> ${line}` : '>'))
            .join('\n')
        : '>'

    summary.hintBlocksConverted += 1
    return `> **${label}**\n${quotedBody}`
  })
}

function extractStepTitleAndBody(stepContent: string): { title: string | null; body: string } {
  const lines = normalizeLiquidBlockContent(stepContent).split('\n')
  let headingIndex = -1
  let headingTitle: string | null = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line.length === 0) {
      continue
    }

    const headingMatch = line.match(/^#{1,6}\s+(.*)$/)
    if (headingMatch) {
      headingIndex = index
      headingTitle = headingMatch[1].trim()
    }
    break
  }

  if (headingIndex >= 0) {
    lines.splice(headingIndex, 1)
  }

  return {
    title: headingTitle,
    body: lines.join('\n').trim()
  }
}

function buildStepMarkdown(stepContent: string, stepLabel: string): string {
  const { title, body } = extractStepTitleAndBody(stepContent)
  const heading = title ? `### ${stepLabel}: ${title}` : `### ${stepLabel}`

  if (body.length === 0) {
    return heading
  }

  return `${heading}\n\n${body}`
}

function convertSteppers(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_STEPPER_REGEX, (fullMatch, stepperContent: string) => {
    GITBOOK_STEP_REGEX.lastIndex = 0
    const stepMatches = Array.from(stepperContent.matchAll(GITBOOK_STEP_REGEX))
    if (stepMatches.length === 0) {
      return fullMatch
    }

    summary.stepperBlocksConverted += 1
    summary.stepsConverted += stepMatches.length

    return stepMatches
      .map((stepMatch, index) => buildStepMarkdown(stepMatch[1], `Step ${index + 1}`))
      .filter((block) => block.trim().length > 0)
      .join('\n\n')
  })
}

function convertStandaloneSteps(markdown: string, summary: GitBookNormalizationSummary): string {
  GITBOOK_STEP_REGEX.lastIndex = 0
  return markdown.replace(GITBOOK_STEP_REGEX, (_fullMatch, stepContent: string) => {
    summary.stepsConverted += 1
    return buildStepMarkdown(stepContent, 'Step')
  })
}

function removeCodeWrappers(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_CODE_WRAPPER_REGEX, () => {
    summary.codeWrappersRemoved += 1
    return ''
  })
}

function removeAnchorTags(markdown: string, summary: GitBookNormalizationSummary): string {
  return markdown.replace(GITBOOK_ANCHOR_TAG_REGEX, () => {
    summary.anchorTagsRemoved += 1
    return ''
  })
}

function cleanupWhitespace(markdown: string): string {
  return markdown.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').trimEnd()
}

export function hasGitBookMarkdownSyntax(markdown: string): boolean {
  return (
    FRONTMATTER_REGEX.test(markdown) ||
    GITBOOK_EMBED_DETECT_REGEX.test(markdown) ||
    GITBOOK_FIGURE_DETECT_REGEX.test(markdown) ||
    GITBOOK_PICTURE_DETECT_REGEX.test(markdown) ||
    GITBOOK_HINT_DETECT_REGEX.test(markdown) ||
    GITBOOK_STEPPER_DETECT_REGEX.test(markdown) ||
    GITBOOK_STEP_DETECT_REGEX.test(markdown) ||
    GITBOOK_CODE_WRAPPER_DETECT_REGEX.test(markdown) ||
    GITBOOK_ANCHOR_TAG_DETECT_REGEX.test(markdown)
  )
}

export function normalizeGitBookMarkdown(markdown: string): GitBookNormalizationResult {
  const summary = emptySummary()
  const unixMarkdown = markdown.replace(/\r\n?/g, '\n')

  const withoutFrontmatter = stripFrontmatter(unixMarkdown, summary)
  const withoutAnchors = removeAnchorTags(withoutFrontmatter, summary)
  const withConvertedEmbeds = convertEmbeds(withoutAnchors, summary)
  const withConvertedFigures = convertFigures(withConvertedEmbeds, summary)
  const withConvertedPictures = convertPictures(withConvertedFigures, summary)
  const withConvertedHints = convertHints(withConvertedPictures, summary)
  const withConvertedSteppers = convertSteppers(withConvertedHints, summary)
  const withStandaloneSteps = convertStandaloneSteps(withConvertedSteppers, summary)
  const withoutCodeWrappers = removeCodeWrappers(withStandaloneSteps, summary)
  const normalized = cleanupWhitespace(withoutCodeWrappers)

  return {
    markdown: normalized,
    summary,
    changed: normalized !== markdown
  }
}

export function summarizeGitBookNormalization(summary: GitBookNormalizationSummary): string[] {
  const messages: string[] = []

  if (summary.frontmatterBlocksRemoved > 0) {
    messages.push(`frontmatter removed: ${summary.frontmatterBlocksRemoved}`)
  }
  if (summary.descriptionCalloutsAdded > 0) {
    messages.push(`description callouts added: ${summary.descriptionCalloutsAdded}`)
  }
  if (summary.embedBlocksConverted > 0) {
    messages.push(`embeds converted: ${summary.embedBlocksConverted}`)
  }
  if (summary.figureBlocksConverted > 0) {
    messages.push(`figures converted: ${summary.figureBlocksConverted}`)
  }
  if (summary.pictureBlocksConverted > 0) {
    messages.push(`pictures converted: ${summary.pictureBlocksConverted}`)
  }
  if (summary.hintBlocksConverted > 0) {
    messages.push(`hints converted: ${summary.hintBlocksConverted}`)
  }
  if (summary.stepperBlocksConverted > 0) {
    messages.push(`steppers converted: ${summary.stepperBlocksConverted}`)
  }
  if (summary.stepsConverted > 0) {
    messages.push(`steps converted: ${summary.stepsConverted}`)
  }
  if (summary.codeWrappersRemoved > 0) {
    messages.push(`code wrappers removed: ${summary.codeWrappersRemoved}`)
  }
  if (summary.anchorTagsRemoved > 0) {
    messages.push(`anchor tags removed: ${summary.anchorTagsRemoved}`)
  }

  return messages
}
