'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mendoza } from '@arkiv-network/sdk/chains'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const wagmiConfig = createConfig({
  chains: [mendoza],
  connectors: [injected()],
  transports: {
    [mendoza.id]: http(process.env.NEXT_PUBLIC_ARKIV_RPC_URL)
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
