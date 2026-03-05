import { buildAgentOpenApiDocument } from '@/features/agent/openapi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(buildAgentOpenApiDocument(), { status: 200 })
}
