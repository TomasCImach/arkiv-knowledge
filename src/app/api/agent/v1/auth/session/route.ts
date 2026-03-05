import { getAgentViewer } from '@/features/agent/auth'
import { jsonAgentData } from '@/features/agent/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const viewer = await getAgentViewer()

  return jsonAgentData({
    address: viewer ?? null
  })
}
