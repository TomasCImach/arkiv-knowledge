'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { ConnectButton, RainbowKitProvider } from '@rainbow-me/rainbowkit'

export function WalletStatusClient() {
  return (
    <RainbowKitProvider>
      <ConnectButton chainStatus="icon" />
    </RainbowKitProvider>
  )
}
