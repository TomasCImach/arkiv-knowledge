import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { GitBookMigrationTool } from '@/app/_components/gitbook-migration-tool'

describe('gitbook migration tool', () => {
  afterEach(() => {
    cleanup()
  })

  it('converts gitbook wrappers into standard markdown output', async () => {
    render(<GitBookMigrationTool />)

    fireEvent.change(screen.getByLabelText('GitBook markdown input'), {
      target: {
        value:
          '---\n' +
          'description: "Sample description"\n' +
          '---\n' +
          '{% hint style="warning" %}\n' +
          'Import quality may vary.\n' +
          '{% endhint %}\n' +
          '<figure><img src="../.gitbook/assets/25_12_10_import@2x.png" alt="A GitBook screenshot showing the import panel"><figcaption><p>The import panel in GitBook.</p></figcaption></figure>\n' +
          '<picture><source srcset="../.gitbook/assets/25_01_10_actions_icon_dark.svg" media="(prefers-color-scheme: dark)"><img src="../.gitbook/assets/25_01_10_actions_icon_light.svg" alt="The Actions menu icon in GitBook"></picture>\n' +
          '{% stepper %}\n' +
          '{% step %}\n' +
          '#### Convert your content into Markdown\n' +
          '\n' +
          'Use Markdown files where possible.\n' +
          '{% endstep %}\n' +
          '{% step %}\n' +
          '#### Organize your content in GitHub or GitLab\n' +
          '\n' +
          'Group docs by space scope.\n' +
          '{% endstep %}\n' +
          '{% endstepper %}\n' +
          '{% embed url="https://example.com/docs" %}\n' +
          '{% code title="demo.ts" lineNumbers="true" %}\n' +
          '```ts\n' +
          "console.log('ok')\n" +
          '```\n' +
          '{% endcode %}'
      }
    })

    const output = screen.getByLabelText('Converted markdown') as HTMLTextAreaElement
    expect(output.value).toContain('> **Description:** Sample description')
    expect(output.value).toContain('> **Warning**')
    expect(output.value).toContain('> Import quality may vary.')
    expect(output.value).toContain(
      '![A GitBook screenshot showing the import panel](../.gitbook/assets/25_12_10_import@2x.png)'
    )
    expect(output.value).toContain('*The import panel in GitBook.*')
    expect(output.value).toContain(
      '![The Actions menu icon in GitBook](../.gitbook/assets/25_01_10_actions_icon_light.svg)'
    )
    expect(output.value).toContain('### Step 1: Convert your content into Markdown')
    expect(output.value).toContain('### Step 2: Organize your content in GitHub or GitLab')
    expect(output.value).toContain('[Embedded content](https://example.com/docs)')
    expect(output.value).not.toContain('{% code')
    expect(output.value).not.toContain('{% hint')
    expect(output.value).not.toContain('{% stepper')
    expect(output.value).not.toContain('description:')
    expect(screen.getByText('Transforms applied')).toBeInTheDocument()
  })
})
