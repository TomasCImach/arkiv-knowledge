import { handleIntentPost } from '@/features/agent/intent-route'
import { buildTransferPageIntent } from '@/features/agent/intents'
import { transferPageIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, transferPageIntentSchema, buildTransferPageIntent)
}
