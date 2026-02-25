import { chainFromName } from '@arkiv-network/sdk'
import { kaolin } from '@arkiv-network/sdk/chains'
import type { Chain } from 'viem'

export const DEFAULT_ARKIV_CHAIN_NAME = 'kaolin'

export type ArkivConfig = {
  chain: Chain
  chainName: string
  rpcUrl?: string
}

let cachedConfig: ArkivConfig | undefined

export function getArkivConfig(): ArkivConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const chainName =
    process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? process.env.ARKIV_CHAIN ?? DEFAULT_ARKIV_CHAIN_NAME

  let chain: Chain
  try {
    chain = chainFromName(chainName)
  } catch {
    chain = kaolin
  }

  cachedConfig = {
    chain,
    chainName: chain.name,
    rpcUrl: process.env.NEXT_PUBLIC_ARKIV_RPC_URL ?? process.env.ARKIV_RPC_URL
  }

  return cachedConfig
}
