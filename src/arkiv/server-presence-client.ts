import 'server-only'

import { createWalletClient, http } from '@arkiv-network/sdk'
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts'
import type { Hex } from 'viem'
import { isHex } from 'viem'
import { getArkivConfig } from '@/arkiv/config'

let cachedClient: ReturnType<typeof createWalletClient> | undefined
let cachedPrivateKey: Hex | undefined

function resolvePresencePrivateKey(): Hex {
  const configured =
    (process.env.ARKIV_PRESENCE_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_SERVER_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_DEMO_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_LIVE_TEST_PRIVATE_KEY as Hex | undefined)

  if (!configured) {
    throw new Error(
      'Presence signer key is missing. Set ARKIV_PRESENCE_PRIVATE_KEY (or ARKIV_SERVER_PRIVATE_KEY).'
    )
  }

  if (!isHex(configured, { strict: true }) || configured.length !== 66) {
    throw new Error('Presence signer key must be a 32-byte 0x-prefixed private key.')
  }

  return configured
}

export function getArkivPresenceServerClient() {
  const privateKey = resolvePresencePrivateKey()
  if (cachedClient && cachedPrivateKey === privateKey) {
    return cachedClient
  }

  const config = getArkivConfig()
  const rpcUrl = config.rpcUrl ?? config.chain.rpcUrls.default.http[0]
  cachedPrivateKey = privateKey
  cachedClient = createWalletClient({
    chain: config.chain,
    transport: http(rpcUrl),
    account: privateKeyToAccount(privateKey)
  })

  return cachedClient
}
