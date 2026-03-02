'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { ConnectButton, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useSignMessage } from 'wagmi'
import { useAccount } from 'wagmi'
import { clearWalletReadSession, ensureWalletReadSession, readWalletSessionAddress } from '@/features/auth/client-session'

export function WalletStatusClient() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)
  const hadWalletConnectionRef = useRef(false)

  useEffect(() => {
    if (isConnected) {
      hadWalletConnectionRef.current = true
      return
    }

    if (!hadWalletConnectionRef.current) {
      return
    }
    hadWalletConnectionRef.current = false
    setStatusText('')
    void clearWalletReadSession()
  }, [isConnected])

  async function verifyWalletSession() {
    if (!address || !isConnected) {
      setStatusText('Connect wallet first.')
      return
    }

    setPending(true)
    try {
      await ensureWalletReadSession(address as Hex, (message) => signMessageAsync({ message }))
      setStatusText('Private-read session verified.')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Wallet verification failed.'
      setStatusText(message)
    } finally {
      setPending(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function syncStatus() {
      if (!address || !isConnected) {
        if (!cancelled) {
          setStatusText('')
        }
        return
      }

      const sessionAddress = await readWalletSessionAddress()
      if (cancelled) {
        return
      }

      if (sessionAddress && sessionAddress.toLowerCase() === address.toLowerCase()) {
        setStatusText('Private-read session active.')
        return
      }

      if (sessionAddress && sessionAddress.toLowerCase() !== address.toLowerCase()) {
        await clearWalletReadSession()
        if (cancelled) {
          return
        }
      }

      setStatusText('')
    }

    void syncStatus()
    return () => {
      cancelled = true
    }
  }, [address, isConnected])

  return (
    <RainbowKitProvider>
      <div className="toolbar" style={{ gap: '0.5rem' }}>
        <ConnectButton chainStatus="icon" />
        {isConnected ? (
          <button type="button" className="button secondary" onClick={() => void verifyWalletSession()} disabled={pending}>
            {pending ? 'Verifying...' : 'Verify Private Access'}
          </button>
        ) : null}
        {statusText ? <span className="subtitle">{statusText}</span> : null}
      </div>
    </RainbowKitProvider>
  )
}
