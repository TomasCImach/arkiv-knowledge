'use client'

import dynamic from 'next/dynamic'

const WalletStatus = dynamic(
  () => import('@/app/_components/wallet-status-client').then((module) => module.WalletStatusClient),
  { ssr: false }
)

export { WalletStatus }
