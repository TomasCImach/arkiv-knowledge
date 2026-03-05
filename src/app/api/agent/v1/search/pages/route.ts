import { searchPagesGlobal } from '@/arkiv/queries/pages'
import { listSpaces } from '@/arkiv/queries/spaces'
import { getAgentViewer } from '@/features/agent/auth'
import { toPageDto } from '@/features/agent/dto'
import { jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { parseGlobalPageSearch } from '@/features/agent/query'
import { filterPagesByVisibleSpaces } from '@/features/visibility/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toSearchParamRecord(searchParams: URLSearchParams): Record<string, string | string[] | undefined> {
  const record: Record<string, string | string[] | undefined> = {}

  for (const [key, value] of searchParams.entries()) {
    const existing = record[key]
    if (existing === undefined) {
      record[key] = value
      continue
    }

    if (Array.isArray(existing)) {
      record[key] = existing.concat(value)
      continue
    }

    record[key] = [existing, value]
  }

  return record
}

export async function GET(request: Request) {
  try {
    const query = parseGlobalPageSearch(toSearchParamRecord(new URL(request.url).searchParams))
    const viewer = await getAgentViewer()

    const [pages, spaces] = await Promise.all([searchPagesGlobal(query), listSpaces(200)])
    const visiblePages = filterPagesByVisibleSpaces(pages, spaces, viewer)

    return jsonAgentData({
      items: visiblePages.map(toPageDto),
      total: visiblePages.length
    })
  } catch (error) {
    return jsonAgentError(error)
  }
}
