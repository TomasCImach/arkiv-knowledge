import { describe, expect, it } from 'vitest'
import { extractWikiLinks } from '@/lib/text'

describe('wiki link extraction', () => {
  it('extracts normalized wiki links and removes duplicates', () => {
    const links = extractWikiLinks('See [[Getting Started]] and [[getting started]] and [[Alias|Deep Dive]].')

    expect(links).toEqual(['getting-started', 'deep-dive'])
  })
})
