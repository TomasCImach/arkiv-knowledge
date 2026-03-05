import { getArkivConfig } from '@/arkiv/config'
import { jsonAgentData } from '@/features/agent/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const config = getArkivConfig()

  return jsonAgentData({
    apiVersion: 'v1',
    app: 'arklib',
    chain: {
      id: config.chain.id,
      name: config.chain.name,
      rpcUrl: config.rpcUrl ?? config.chain.rpcUrls.default.http[0]
    },
    capabilities: {
      readEndpoints: true,
      writeIntents: true,
      writeExecution: 'wallet-signed',
      openApi: '/api/agent/v1/openapi'
    }
  })
}
