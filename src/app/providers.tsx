'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { chainFromName } from '@arkiv-network/sdk'
import { kaolin } from '@arkiv-network/sdk/chains'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const resolvedChain = (() => {
  const chainName = process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? 'kaolin'
  try {
    return chainFromName(chainName)
  } catch {
    return kaolin
  }
})()

const walletRpcTransportUrl = process.env.NEXT_PUBLIC_ARKIV_RPC_URL ?? '/api/arkiv-rpc'

const wagmiConfig = createConfig({
  chains: [resolvedChain],
  connectors: [injected()],
  transports: {
    [resolvedChain.id]: http(walletRpcTransportUrl)
  },
  ssr: true
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
