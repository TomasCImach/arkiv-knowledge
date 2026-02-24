'use client'

import { useMemo } from 'react'
import type { EIP1193Provider, Hex } from 'viem'
import { useAccount } from 'wagmi'
import { createConnectedArkivWalletClient } from '@/arkiv/clients'

export function useArkivWalletClient() {
  const { address, isConnected } = useAccount()

  return useMemo(() => {
    if (typeof window === 'undefined' || !isConnected || !address) {
      return undefined
    }

    const provider = (window as Window & { ethereum?: EIP1193Provider }).ethereum
    if (!provider) {
      return undefined
    }

    return createConnectedArkivWalletClient(address as Hex, provider)
  }, [address, isConnected])
}
