import { handleIntentPost } from '@/features/agent/intent-route'
import { buildArchivePageIntent } from '@/features/agent/intents'
import { archivePageIntentSchema } from '@/features/agent/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleIntentPost(request, archivePageIntentSchema, buildArchivePageIntent)
}
