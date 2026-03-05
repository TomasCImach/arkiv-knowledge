import { handleIntentPost } from '@/features/agent/intent-route'
import { buildCreatePageIntent } from '@/features/agent/intents'
import { createPageIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, createPageIntentSchema, buildCreatePageIntent)
}
