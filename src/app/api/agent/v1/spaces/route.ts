import { listSpaces } from '@/arkiv/queries/spaces'
import { toSpaceDto } from '@/features/agent/dto'
import { jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { filterListedSpaces } from '@/features/visibility/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const spaces = await listSpaces(100)
    const listedSpaces = filterListedSpaces(spaces)

    return jsonAgentData({
      items: listedSpaces.map(toSpaceDto),
      total: listedSpaces.length
    })
  } catch (error) {
    return jsonAgentError(error)
  }
}
