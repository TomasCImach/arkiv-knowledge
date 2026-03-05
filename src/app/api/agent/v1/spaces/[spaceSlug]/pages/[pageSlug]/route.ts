import { getPageBySlugInSpace } from '@/arkiv/queries/pages'
import { getSpaceBySlug } from '@/arkiv/queries/spaces'
import { getAgentViewer } from '@/features/agent/auth'
import { toPageDto } from '@/features/agent/dto'
import { AgentApiRequestError, jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { canViewSpace } from '@/features/visibility/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spaceSlug: string; pageSlug: string }> }
) {
  try {
    void request
    const { spaceSlug, pageSlug } = await params
    const [space, viewer] = await Promise.all([getSpaceBySlug(spaceSlug), getAgentViewer()])

    if (!space || !canViewSpace(space, viewer)) {
      throw new AgentApiRequestError('NOT_FOUND', `Space "${spaceSlug}" not found.`, 404)
    }

    const page = await getPageBySlugInSpace(space.entityKey, pageSlug)

    if (!page) {
      throw new AgentApiRequestError('NOT_FOUND', `Page "${pageSlug}" not found in space "${spaceSlug}".`, 404)
    }

    return jsonAgentData({
      item: toPageDto(page)
    })
  } catch (error) {
    return jsonAgentError(error)
  }
}
