import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createPublicClient, createWalletClient, http, chainFromName } from '@arkiv-network/sdk'
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts'
import { mendoza } from '@arkiv-network/sdk/chains'
import type { Chain, Hex } from 'viem'
import { createPage } from '../src/arkiv/mutations/pages'
import { createSpace } from '../src/arkiv/mutations/spaces'
import { getPageBySlug, getSpaceBySlug } from '../src/arkiv/queries'

type DemoDataset = {
  space: {
    slug: string
    name: string
    description: string
    visibility: 'public' | 'unlisted' | 'private'
  }
  pages: Array<{
    slug: string
    title: string
    summary: string
    status: 'draft' | 'published' | 'archived'
    bodyMarkdown: string
  }>
}

function loadDataset(): DemoDataset {
  const filePath = path.join(process.cwd(), 'scripts', 'demo-dataset.json')
  return JSON.parse(readFileSync(filePath, 'utf8')) as DemoDataset
}

async function waitForSpace(slug: string, maxAttempts = 8) {
  for (let index = 0; index < maxAttempts; index += 1) {
    const found = await getSpaceBySlug(slug)
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return null
}

async function main() {
  const privateKey =
    (process.env.ARKIV_DEMO_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_LIVE_TEST_PRIVATE_KEY as Hex | undefined)

  if (!privateKey) {
    console.log('SKIP seed-demo: set ARKIV_DEMO_PRIVATE_KEY or ARKIV_LIVE_TEST_PRIVATE_KEY')
    return
  }

  const dataset = loadDataset()
  const chainName = process.env.ARKIV_CHAIN ?? process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? 'mendoza'
  const rpcUrl = process.env.ARKIV_RPC_URL ?? process.env.NEXT_PUBLIC_ARKIV_RPC_URL

  let chain: Chain = mendoza
  try {
    chain = chainFromName(chainName)
  } catch {
    chain = mendoza
  }

  const transport = http(rpcUrl)

  createPublicClient({ chain, transport })
  const walletClient = createWalletClient({
    chain,
    transport,
    account: privateKeyToAccount(privateKey)
  })

  let space = await getSpaceBySlug(dataset.space.slug)

  if (!space) {
    const created = await createSpace(walletClient, {
      spaceSlug: dataset.space.slug,
      name: dataset.space.name,
      description: dataset.space.description,
      visibility: dataset.space.visibility
    })

    console.log(`Created space ${created.entityKey}`)
    space = await waitForSpace(dataset.space.slug)
  }

  if (!space) {
    throw new Error('Failed to locate seeded space after creation')
  }

  for (const page of dataset.pages) {
    const existing = await getPageBySlug(space.spaceSlug, page.slug)
    if (existing) {
      console.log(`Page exists: ${page.slug}`)
      continue
    }

    const createdPage = await createPage(walletClient, {
      spaceKey: space.entityKey,
      spaceSlug: space.spaceSlug,
      pageSlug: page.slug,
      title: page.title,
      summary: page.summary,
      status: page.status,
      bodyMarkdown: page.bodyMarkdown,
      editor: walletClient.account.address
    })

    console.log(`Created page ${page.slug} (${createdPage.pageKey})`)
  }

  console.log('Demo dataset seeding complete.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
