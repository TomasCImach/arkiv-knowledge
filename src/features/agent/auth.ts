import type { Hex } from 'viem'
import { AgentApiRequestError } from '@/features/agent/errors'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'

export async function getAgentViewer(): Promise<Hex | undefined> {
  return getAuthenticatedViewerAddress()
}

export async function requireAgentViewer(): Promise<Hex> {
  const viewer = await getAuthenticatedViewerAddress()
  if (!viewer) {
    throw new AgentApiRequestError('AUTH_REQUIRED', 'Wallet session verification required.', 401)
  }

  return viewer
}
