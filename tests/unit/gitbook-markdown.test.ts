import { describe, expect, it } from 'vitest'
import {
  hasGitBookMarkdownSyntax,
  normalizeGitBookMarkdown,
  summarizeGitBookNormalization
} from '@/features/migration/gitbook-markdown'

describe('gitbook markdown normalization', () => {
  it('removes frontmatter and maps description into markdown callout', () => {
    const input = `---
description: >-
  Migrated from GitBook docs.
---
# Title
`
    const result = normalizeGitBookMarkdown(input)

    expect(result.markdown).toContain('> **Description:** Migrated from GitBook docs.')
    expect(result.markdown).toContain('# Title')
    expect(result.markdown).not.toContain('description: >-')
    expect(result.summary.frontmatterBlocksRemoved).toBe(1)
    expect(result.summary.descriptionCalloutsAdded).toBe(1)
  })

  it('converts embeds and removes gitbook code wrappers', () => {
    const input = `{% embed url="https://example.com/clip" %}
{% code title="app.ts" lineNumbers="true" %}
\`\`\`ts
console.log('test')
\`\`\`
{% endcode %}`
    const result = normalizeGitBookMarkdown(input)

    expect(result.markdown).toContain('[Embedded content](https://example.com/clip)')
    expect(result.markdown).toContain("console.log('test')")
    expect(result.markdown).not.toContain('{% code')
    expect(result.markdown).not.toContain('{% endcode %}')
    expect(result.summary.embedBlocksConverted).toBe(1)
    expect(result.summary.codeWrappersRemoved).toBe(2)
  })

  it('removes heading anchor tags', () => {
    const input = `<a href="#section-a" id="section-a"></a>
## Section A
`
    const result = normalizeGitBookMarkdown(input)

    expect(result.markdown).toBe('## Section A')
    expect(result.summary.anchorTagsRemoved).toBe(1)
  })

  it('converts gitbook figure html into markdown image and caption', () => {
    const input =
      '<figure><img src="../.gitbook/assets/25_12_10_import@2x.png" alt="A GitBook screenshot showing the import panel">' +
      '<figcaption><p>The import panel in GitBook.</p></figcaption></figure>'
    const result = normalizeGitBookMarkdown(input)

    expect(result.markdown).toContain(
      '![A GitBook screenshot showing the import panel](../.gitbook/assets/25_12_10_import@2x.png)'
    )
    expect(result.markdown).toContain('*The import panel in GitBook.*')
    expect(result.summary.figureBlocksConverted).toBe(1)
  })

  it('reports summary labels and syntax detection', () => {
    const input = `{% embed url="https://example.com" %}`
    const result = normalizeGitBookMarkdown(input)
    const summary = summarizeGitBookNormalization(result.summary)

    expect(hasGitBookMarkdownSyntax(input)).toBe(true)
    expect(hasGitBookMarkdownSyntax('# Plain Markdown')).toBe(false)
    expect(summary).toContain('embeds converted: 1')
  })

  it('converts hints, picture tags, and steppers from gitbook blocks', () => {
    const input = `{% hint style="info" %}
GitBook is Markdown-based.
{% endhint %}

<picture><source srcset="../.gitbook/assets/dark.svg" media="(prefers-color-scheme: dark)"><img src="../.gitbook/assets/light.svg" alt="The Actions menu icon in GitBook"></picture>

{% stepper %}
{% step %}
#### First step

Do the first thing.
{% endstep %}
{% step %}
#### Second step

Do the second thing.
{% endstep %}
{% endstepper %}`
    const result = normalizeGitBookMarkdown(input)

    expect(result.markdown).toContain('> **Info**')
    expect(result.markdown).toContain('> GitBook is Markdown-based.')
    expect(result.markdown).toContain('![The Actions menu icon in GitBook](../.gitbook/assets/light.svg)')
    expect(result.markdown).toContain('### Step 1: First step')
    expect(result.markdown).toContain('### Step 2: Second step')
    expect(result.markdown).not.toContain('{% hint')
    expect(result.markdown).not.toContain('{% stepper')
    expect(result.summary.hintBlocksConverted).toBe(1)
    expect(result.summary.pictureBlocksConverted).toBe(1)
    expect(result.summary.stepperBlocksConverted).toBe(1)
    expect(result.summary.stepsConverted).toBe(2)
  })
})
