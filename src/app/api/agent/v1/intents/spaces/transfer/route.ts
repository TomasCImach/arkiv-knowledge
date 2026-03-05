import { handleIntentPost } from '@/features/agent/intent-route'
import { buildTransferSpaceIntent } from '@/features/agent/intents'
import { transferSpaceIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, transferSpaceIntentSchema, buildTransferSpaceIntent)
}
