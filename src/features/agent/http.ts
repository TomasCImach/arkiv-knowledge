import { AgentApiRequestError } from '@/features/agent/errors'

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new AgentApiRequestError('VALIDATION_ERROR', 'Invalid JSON body.', 400)
  }
}
