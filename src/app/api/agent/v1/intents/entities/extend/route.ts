import { handleIntentPost } from '@/features/agent/intent-route'
import { buildExtendEntityIntent } from '@/features/agent/intents'
import { extendEntityIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, extendEntityIntentSchema, buildExtendEntityIntent)
}
