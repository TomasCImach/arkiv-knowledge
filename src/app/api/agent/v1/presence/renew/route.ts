import type { Hex } from 'viem'
import { heartbeatPresenceWithServerSigner } from '@/arkiv/mutations/presence-server'
import { requireAgentViewer } from '@/features/agent/auth'
import { jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { readJsonBody } from '@/features/agent/http'
import { presenceEntitySchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
  try {
    await requireAgentViewer()
    const body = await readJsonBody(request)
    const input = presenceEntitySchema.parse(body)

    const result = await heartbeatPresenceWithServerSigner(input.entityKey as Hex)

    return jsonAgentData(result)
  } catch (error) {
    return jsonAgentError(error)
  }
}
