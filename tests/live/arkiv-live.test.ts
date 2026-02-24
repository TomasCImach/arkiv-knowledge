import { randomUUID } from 'node:crypto'
import { createPublicClient, createWalletClient, http, jsonToPayload, chainFromName } from '@arkiv-network/sdk'
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts'
import { mendoza } from '@arkiv-network/sdk/chains'
import type { Hex } from 'viem'

async function main() {
  const privateKey = process.env.ARKIV_LIVE_TEST_PRIVATE_KEY as Hex | undefined
  if (!privateKey) {
    console.log('SKIP live test: ARKIV_LIVE_TEST_PRIVATE_KEY is not set')
    return
  }

  const chainName = process.env.ARKIV_CHAIN ?? process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? 'mendoza'
  const rpcUrl = process.env.ARKIV_RPC_URL ?? process.env.NEXT_PUBLIC_ARKIV_RPC_URL
  const chain = (() => {
    try {
      return chainFromName(chainName)
    } catch {
      return mendoza
    }
  })()

  const transport = http(rpcUrl)
  const publicClient = createPublicClient({ chain, transport })
  const walletClient = createWalletClient({
    chain,
    transport,
    account: privateKeyToAccount(privateKey)
  })

  const marker = randomUUID()
  const createResult = await walletClient.createEntity({
    payload: jsonToPayload({ marker }),
    contentType: 'application/json',
    attributes: [
      { key: 'type', value: 'kb.live-smoke' },
      { key: 'schemaVersion', value: '1' },
      { key: 'marker', value: marker }
    ],
    expiresIn: 300
  })

  const entity = await publicClient.getEntity(createResult.entityKey)
  const payload = entity.toJson() as { marker?: string }

  if (payload.marker !== marker) {
    throw new Error('Live test failed: fetched payload marker mismatch')
  }

  console.log(`Live smoke passed: ${createResult.entityKey}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
