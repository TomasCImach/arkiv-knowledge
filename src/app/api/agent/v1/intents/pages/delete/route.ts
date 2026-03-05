import { handleIntentPost } from '@/features/agent/intent-route'
import { buildDeletePageIntent } from '@/features/agent/intents'
import { deletePageIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, deletePageIntentSchema, buildDeletePageIntent)
}
