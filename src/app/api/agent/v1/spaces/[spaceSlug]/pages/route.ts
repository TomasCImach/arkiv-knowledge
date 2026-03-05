import { getSpaceBySlug } from '@/arkiv/queries/spaces'
import { searchPages } from '@/arkiv/queries/pages'
import { getAgentViewer } from '@/features/agent/auth'
import { toPageDto } from '@/features/agent/dto'
import { AgentApiRequestError, jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { parseGlobalPageSearch } from '@/features/agent/query'
import { canViewSpace } from '@/features/visibility/access'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spaceSlug: string }> }
) {
  try {
    const { spaceSlug } = await params
    const [space, viewer] = await Promise.all([getSpaceBySlug(spaceSlug), getAgentViewer()])

    if (!space || !canViewSpace(space, viewer)) {
      throw new AgentApiRequestError('NOT_FOUND', `Space "${spaceSlug}" not found.`, 404)
    }

    const query = parseGlobalPageSearch(toSearchParamRecord(new URL(request.url).searchParams))
    const pages = await searchPages(
      {
        ...query,
        spaceSlug,
        spaceKey: space.entityKey
      },
      undefined
    )

    return jsonAgentData({
      items: pages.map(toPageDto),
      total: pages.length,
      scope: {
        spaceSlug,
        spaceKey: space.entityKey
      }
    })
  } catch (error) {
    return jsonAgentError(error)
  }
}
