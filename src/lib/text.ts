const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function tokenizeForSearch(input: string): string[] {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
    )
  )
}

export function extractWikiLinks(markdown: string): string[] {
  const links = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = WIKI_LINK_REGEX.exec(markdown)) !== null) {
    const rawTarget = match[2] ?? match[1]
    const target = slugify(rawTarget)
    if (target) {
      links.add(target)
    }
  }

  return Array.from(links)
}
