import { handleIntentPost } from '@/features/agent/intent-route'
import { buildUpdatePageIntent } from '@/features/agent/intents'
import { updatePageIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, updatePageIntentSchema, buildUpdatePageIntent)
}
