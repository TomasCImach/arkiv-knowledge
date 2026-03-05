import type { Hex } from 'viem'
import { joinPresenceWithServerSigner } from '@/arkiv/mutations/presence-server'
import { requireAgentViewer } from '@/features/agent/auth'
import { AgentApiRequestError, jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { readJsonBody } from '@/features/agent/http'
import { presenceJoinSchema } from '@/features/agent/schemas'
import { equalAddress } from '@/features/ownership/permissions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const [viewer, body] = await Promise.all([requireAgentViewer(), readJsonBody(request)])
    const input = presenceJoinSchema.parse(body)

    if (!equalAddress(viewer, input.viewer)) {
      throw new AgentApiRequestError('FORBIDDEN', 'Presence viewer must match authenticated wallet session.', 403)
    }

    const result = await joinPresenceWithServerSigner({
      spaceKey: input.spaceKey as Hex,
      pageKey: input.pageKey as Hex,
      viewer: input.viewer as Hex,
      sessionId: input.sessionId,
      displayName: input.displayName
    })

    return jsonAgentData(result)
  } catch (error) {
    return jsonAgentError(error)
  }
}
