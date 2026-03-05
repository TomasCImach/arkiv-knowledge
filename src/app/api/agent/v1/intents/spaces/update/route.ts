import { handleIntentPost } from '@/features/agent/intent-route'
import { buildUpdateSpaceIntent } from '@/features/agent/intents'
import { updateSpaceIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, updateSpaceIntentSchema, buildUpdateSpaceIntent)
}
