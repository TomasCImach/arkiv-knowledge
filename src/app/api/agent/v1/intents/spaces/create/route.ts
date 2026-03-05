import { handleIntentPost } from '@/features/agent/intent-route'
import { buildCreateSpaceIntent } from '@/features/agent/intents'
import { createSpaceIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, createSpaceIntentSchema, buildCreateSpaceIntent)
}
