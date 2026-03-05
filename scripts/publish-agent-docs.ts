import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createPublicClient, createWalletClient, http, chainFromName } from '@arkiv-network/sdk'
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts'
import { kaolin } from '@arkiv-network/sdk/chains'
import type { Chain, Hex } from 'viem'
import { createPage, editPage } from '../src/arkiv/mutations/pages'
import { getPageBySlugInSpace, getSpaceBySlug } from '../src/arkiv/queries'

const DEFAULT_SPACE_SLUG = 'arklib-docs'
const DEFAULT_PAGE_SLUG = 'agent-api-v1'
const DEFAULT_PAGE_TITLE = 'Agent-Friendly API (v1)'
const DEFAULT_SUMMARY =
  'Machine-facing API guide for deterministic reads, wallet-authenticated write intents, and execution workflow.'

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    spaceSlug: DEFAULT_SPACE_SLUG,
    pageSlug: DEFAULT_PAGE_SLUG,
    title: DEFAULT_PAGE_TITLE,
    status: 'published' as 'draft' | 'published' | 'archived'
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    const next = args[i + 1]

    if (arg === '--space' && next) {
      parsed.spaceSlug = next
      i += 1
      continue
    }

    if (arg === '--slug' && next) {
      parsed.pageSlug = next
      i += 1
      continue
    }

    if (arg === '--title' && next) {
      parsed.title = next
      i += 1
      continue
    }

    if (arg === '--status' && next && (next === 'draft' || next === 'published' || next === 'archived')) {
      parsed.status = next
      i += 1
      continue
    }
  }

  return parsed
}

function loadSkillBody(): string {
  const skillPath = path.join(process.cwd(), 'SKILL.md')
  return readFileSync(skillPath, 'utf8')
}

function buildPageBody(skillMarkdown: string): string {
  return [
    '# Agent-Friendly API + Skill',
    '',
    'This page documents the official machine-facing integration surface for Arklib Iteration 37.',
    '',
    '## What was added',
    '- Versioned REST API at `/api/agent/v1`',
    '- OpenAPI document at `/api/agent/v1/openapi`',
    '- Raw skill markdown endpoint at `/skill.md` for bot fetch/discovery',
    '- Wallet-session-authenticated write intent endpoints',
    '- Presence wrappers with viewer/session consistency checks',
    '- In-app execution helper: `executeAgentIntent`',
    '- Official root skill runbook (`SKILL.md`)',
    '',
    '## Core endpoint groups',
    '- `GET /api/agent/v1/meta`',
    '- `GET /api/agent/v1/openapi`',
    '- `GET /api/agent/v1/auth/session`',
    '- `GET /api/agent/v1/spaces` and space/page/revision/backlink read routes',
    '- `GET /api/agent/v1/search/pages`',
    '- `POST /api/agent/v1/intents/*` for space/page lifecycle + ownership + extension',
    '- `POST|PATCH|DELETE /api/agent/v1/presence/*`',
    '',
    '## Write model',
    'Write routes return validated intents (`sdkCall` + optional `followUpCalls` + `postconditions`).',
    'Transactions remain wallet-signed by the caller; no server-custodied owner write path is used.',
    '',
    '## Official SKILL.md',
    '```markdown',
    skillMarkdown,
    '```',
    ''
  ].join('\n')
}

async function main() {
  const { spaceSlug, pageSlug, title, status } = parseArgs()

  const privateKey =
    (process.env.ARKIV_DEMO_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_LIVE_TEST_PRIVATE_KEY as Hex | undefined)

  if (!privateKey) {
    throw new Error('Set ARKIV_DEMO_PRIVATE_KEY or ARKIV_LIVE_TEST_PRIVATE_KEY before publishing docs.')
  }

  const chainName = process.env.ARKIV_CHAIN ?? process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? 'kaolin'
  const rpcUrl = process.env.ARKIV_RPC_URL ?? process.env.NEXT_PUBLIC_ARKIV_RPC_URL

  let chain: Chain = kaolin
  try {
    chain = chainFromName(chainName)
  } catch {
    chain = kaolin
  }

  const transport = http(rpcUrl)

  createPublicClient({ chain, transport })
  const walletClient = createWalletClient({
    chain,
    transport,
    account: privateKeyToAccount(privateKey)
  })

  const space = await getSpaceBySlug(spaceSlug)
  if (!space) {
    throw new Error(`Space "${spaceSlug}" was not found.`)
  }

  const skillMarkdown = loadSkillBody()
  const bodyMarkdown = buildPageBody(skillMarkdown)

  const existing = await getPageBySlugInSpace(space.entityKey, pageSlug)

  if (!existing) {
    const created = await createPage(walletClient, {
      spaceKey: space.entityKey,
      spaceSlug: space.spaceSlug,
      pageSlug,
      title,
      summary: DEFAULT_SUMMARY,
      status,
      bodyMarkdown,
      editor: walletClient.account.address
    })

    console.log(`Created docs page ${pageSlug} (${created.pageKey}) in ${spaceSlug}.`)
    return
  }

  const edited = await editPage(walletClient, {
    spaceKey: space.entityKey,
    spaceSlug: space.spaceSlug,
    pageKey: existing.entityKey,
    pageSlug,
    title,
    summary: DEFAULT_SUMMARY,
    status,
    bodyMarkdown,
    editor: walletClient.account.address,
    createdAt: existing.payload.createdAt,
    parentPageKey: existing.parentPageKey,
    editSummary: 'Publish agent API + SKILL documentation'
  })

  console.log(`Updated docs page ${pageSlug} (${existing.entityKey}) in ${spaceSlug}. tx=${edited.txHash}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
