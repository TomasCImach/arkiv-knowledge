import type { Hex } from 'viem'
import type { ZodType } from 'zod'
import { requireAgentViewer } from '@/features/agent/auth'
import { jsonAgentData, jsonAgentError } from '@/features/agent/errors'
import { readJsonBody } from '@/features/agent/http'
import type { AgentWriteIntent } from '@/features/agent/types'

type IntentBuilder<T> = (viewer: Hex, input: T) => Promise<AgentWriteIntent>

export async function handleIntentPost<T>(
  request: Request,
  schema: ZodType<T>,
  builder: IntentBuilder<T>
) {
  try {
    const [viewer, body] = await Promise.all([requireAgentViewer(), readJsonBody(request)])
    const input = schema.parse(body)
    const intent = await builder(viewer, input)

    return jsonAgentData({ intent })
  } catch (error) {
    return jsonAgentError(error)
  }
}
