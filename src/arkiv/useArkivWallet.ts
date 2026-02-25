'use client'

import { useEffect, useState } from 'react'
import type { EIP1193Provider, Hex } from 'viem'
import { useAccount } from 'wagmi'
import { createConnectedArkivWalletClient } from '@/arkiv/clients'

export function useArkivWalletClient() {
  const { address, chainId, connector, isConnected } = useAccount()
  const [walletClient, setWalletClient] = useState<ReturnType<typeof createConnectedArkivWalletClient> | undefined>()

  useEffect(() => {
    let active = true

    if (typeof window === 'undefined' || !isConnected || !address || !connector) {
      setWalletClient(undefined)
      return () => {
        active = false
      }
    }

    void (async () => {
      try {
        const provider = (await connector.getProvider({
          chainId
        })) as EIP1193Provider | undefined
        if (!active || !provider) {
          if (active) {
            setWalletClient(undefined)
          }
          return
        }

        setWalletClient(createConnectedArkivWalletClient(address as Hex, provider))
      } catch {
        if (active) {
          setWalletClient(undefined)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [address, chainId, connector, isConnected])

  return walletClient
}
