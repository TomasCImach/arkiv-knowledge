import { getSpaceBySlug } from '@/arkiv/queries/spaces'
import { getAgentViewer } from '@/features/agent/auth'
import { toSpaceDto } from '@/features/agent/dto'
import { AgentApiRequestError, jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { canViewSpace } from '@/features/visibility/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spaceSlug: string }> }
) {
  try {
    void request
    const { spaceSlug } = await params
    const [space, viewer] = await Promise.all([getSpaceBySlug(spaceSlug), getAgentViewer()])

    if (!space || !canViewSpace(space, viewer)) {
      throw new AgentApiRequestError('NOT_FOUND', `Space "${spaceSlug}" not found.`, 404)
    }

    return jsonAgentData({
      item: toSpaceDto(space)
    })
  } catch (error) {
    return jsonAgentError(error)
  }
}
