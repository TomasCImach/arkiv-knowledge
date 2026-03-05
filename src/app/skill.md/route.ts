import path from 'node:path'
import { readFile } from 'node:fs/promises'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const skillPath = path.join(process.cwd(), 'SKILL.md')

  try {
    const markdown = await readFile(skillPath, 'utf8')

    return new Response(markdown, {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate'
      }
    })
  } catch {
    return new Response('SKILL.md not found.', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    })
  }
}
