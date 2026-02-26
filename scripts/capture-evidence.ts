import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { chainFromName, createWalletClient, http } from '@arkiv-network/sdk'
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts'
import { kaolin } from '@arkiv-network/sdk/chains'
import type { Chain, Hex } from 'viem'
import { createPage, editPage } from '../src/arkiv/mutations/pages'
import { createSpace } from '../src/arkiv/mutations/spaces'
import { getSpaceBySlug } from '../src/arkiv/queries'

type ArtifactEntry = {
  name: string
  status: 'captured' | 'skipped' | 'failed'
  detail: string
  file?: string
}

type PwResult = {
  output: string
}

const outputRoot = path.join(process.cwd(), 'output', 'playwright', 'evidence-pack')
const screenshotsDir = path.join(outputRoot, 'screenshots')
const tracesDir = path.join(outputRoot, 'traces')
const reportFile = path.join(outputRoot, 'report.json')
const indexFile = path.join(outputRoot, 'ARTIFACT_INDEX.md')

const basePort = Number(process.env.EVIDENCE_PORT ?? 3107)
const baseUrl = `http://127.0.0.1:${basePort}`
const session = process.env.EVIDENCE_SESSION ?? 'evidence-pack'
const failSoft = process.env.EVIDENCE_FAIL_SOFT !== '0'

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName)
  if (!existsSync(filePath)) {
    return
  }

  const content = readFileSync(filePath, 'utf8')
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    if (process.env[key] !== undefined) {
      continue
    }

    let value = rawValue.trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

function ensureOutputDirs() {
  rmSync(outputRoot, { recursive: true, force: true })
  mkdirSync(screenshotsDir, { recursive: true })
  mkdirSync(tracesDir, { recursive: true })
}

function commandExists(command: string): boolean {
  const result = spawnSync('sh', ['-lc', `command -v ${command} >/dev/null 2>&1`], { encoding: 'utf8' })
  return result.status === 0
}

function findPwCommand(): { command: string; baseArgs: string[] } {
  const codeXHome = process.env.CODEX_HOME ?? path.join(process.env.HOME ?? '', '.codex')
  const wrapperPath = path.join(codeXHome, 'skills', 'playwright', 'scripts', 'playwright_cli.sh')

  if (existsSync(wrapperPath)) {
    return {
      command: wrapperPath,
      baseArgs: []
    }
  }

  return {
    command: 'npx',
    baseArgs: ['--yes', '--package', '@playwright/cli', 'playwright-cli']
  }
}

function runPw(
  runner: { command: string; baseArgs: string[] },
  args: string[],
  options?: { allowFailure?: boolean }
): PwResult {
  const result = spawnSync(runner.command, [...runner.baseArgs, '--session', session, ...args], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()

  if (result.status !== 0 && !options?.allowFailure) {
    throw new Error(`playwright-cli ${args.join(' ')} failed:\n${output}`)
  }

  return { output }
}

function extractLinkedPath(output: string): string | null {
  const match = /\((\.playwright-cli\/[^)]+)\)/.exec(output)
  return match ? match[1] : null
}

function copyArtifact(sourceRelativePath: string, destinationAbsolutePath: string) {
  const sourceAbsolutePath = path.join(process.cwd(), sourceRelativePath)
  if (!existsSync(sourceAbsolutePath)) {
    throw new Error(`Artifact path not found: ${sourceRelativePath}`)
  }
  mkdirSync(path.dirname(destinationAbsolutePath), { recursive: true })
  copyFileSync(sourceAbsolutePath, destinationAbsolutePath)
}

async function waitForServer(url: string, timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.ok) {
        return
      }
    } catch {
      // retry
    }
    await sleep(1000)
  }

  throw new Error(`Timed out waiting for server at ${url}`)
}

function startDevServer(): ChildProcessWithoutNullStreams {
  const server = spawn('pnpm', ['dev', '--port', String(basePort)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe'
  })

  server.stdout.on('data', (chunk) => {
    process.stdout.write(`[evidence:dev] ${String(chunk)}`)
  })
  server.stderr.on('data', (chunk) => {
    process.stderr.write(`[evidence:dev] ${String(chunk)}`)
  })

  return server
}

function stopDevServer(server: ChildProcessWithoutNullStreams | undefined) {
  if (!server || server.killed) {
    return
  }
  server.kill('SIGTERM')
}

async function captureRouteScreenshot(
  runner: { command: string; baseArgs: string[] },
  routePath: string,
  outputName: string,
  artifacts: ArtifactEntry[]
) {
  try {
    runPw(runner, ['goto', `${baseUrl}${routePath}`])
    await sleep(1200)
    const shot = runPw(runner, ['screenshot'])
    const shotPath = extractLinkedPath(shot.output)
    if (!shotPath) {
      throw new Error(`Unable to locate screenshot path in output for ${routePath}`)
    }

    const destination = path.join(screenshotsDir, `${outputName}.png`)
    copyArtifact(shotPath, destination)
    artifacts.push({
      name: outputName,
      status: 'captured',
      detail: routePath,
      file: destination
    })
  } catch (error) {
    artifacts.push({
      name: outputName,
      status: 'failed',
      detail: error instanceof Error ? error.message : String(error)
    })
  }
}

function resolveWriterClient() {
  const privateKey =
    (process.env.ARKIV_DEMO_PRIVATE_KEY as Hex | undefined) ??
    (process.env.ARKIV_LIVE_TEST_PRIVATE_KEY as Hex | undefined)

  if (!privateKey) {
    return null
  }

  const chainName = process.env.ARKIV_CHAIN ?? process.env.NEXT_PUBLIC_ARKIV_CHAIN ?? 'kaolin'
  const rpcUrl = process.env.ARKIV_RPC_URL ?? process.env.NEXT_PUBLIC_ARKIV_RPC_URL

  let chain: Chain = kaolin
  try {
    chain = chainFromName(chainName)
  } catch {
    chain = kaolin
  }

  return createWalletClient({
    chain,
    transport: http(rpcUrl),
    account: privateKeyToAccount(privateKey)
  })
}

async function runRealtimeTwoTabScenario(
  runner: { command: string; baseArgs: string[] },
  artifacts: ArtifactEntry[]
) {
  const walletClient = resolveWriterClient()
  if (!walletClient) {
    artifacts.push({
      name: 'realtime-two-tab',
      status: 'skipped',
      detail: 'Missing ARKIV_DEMO_PRIVATE_KEY/ARKIV_LIVE_TEST_PRIVATE_KEY for realtime write mutation.'
    })
    return
  }

  const seedResult = spawnSync('pnpm', ['seed:demo'], {
    cwd: process.cwd(),
    encoding: 'utf8'
  })
  if (seedResult.status !== 0) {
    artifacts.push({
      name: 'realtime-two-tab',
      status: 'failed',
      detail: `seed:demo failed:\n${seedResult.stdout}\n${seedResult.stderr}`
    })
    return
  }

  const space = await getSpaceBySlug('arkiv-demo')
  if (!space) {
    const createdSpace = await createSpace(walletClient, {
      spaceSlug: 'arkiv-demo',
      name: 'Arkiv Demo',
      description: 'Realtime evidence space',
      visibility: 'public'
    })
    artifacts.push({
      name: 'realtime-two-tab-space',
      status: 'captured',
      detail: `Created space ${createdSpace.entityKey}`
    })
  }

  const latestSpace = await getSpaceBySlug('arkiv-demo')
  if (!latestSpace) {
    artifacts.push({
      name: 'realtime-two-tab',
      status: 'failed',
      detail: 'Unable to resolve arkiv-demo space for realtime scenario.'
    })
    return
  }

  const proofSlug = `realtime-proof-${Date.now().toString().slice(-6)}`
  const createResult = await createPage(walletClient, {
    spaceKey: latestSpace.entityKey,
    spaceSlug: latestSpace.spaceSlug,
    pageSlug: proofSlug,
    title: 'Realtime Proof Page',
    summary: 'Initial realtime summary',
    status: 'published',
    bodyMarkdown: 'Initial realtime body',
    editor: walletClient.account.address
  })

  const proofUrl = `${baseUrl}/spaces/${latestSpace.spaceSlug}/${proofSlug}`
  runPw(runner, ['goto', proofUrl])
  runPw(runner, ['tab-new', proofUrl])
  runPw(runner, ['tab-select', '1'])
  const traceStart = runPw(runner, ['tracing-start'])

  const marker = `Realtime marker ${Date.now()}`
  await editPage(walletClient, {
    spaceKey: latestSpace.entityKey,
    spaceSlug: latestSpace.spaceSlug,
    pageKey: createResult.pageKey,
    pageSlug: proofSlug,
    title: 'Realtime Proof Page',
    summary: marker,
    status: 'published',
    bodyMarkdown: `Initial realtime body\n\n${marker}`,
    editor: walletClient.account.address,
    editSummary: 'Realtime evidence marker'
  })

  let observed = false
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const evalResult = runPw(runner, ['eval', `document.body.innerText.includes(${JSON.stringify(marker)})`], {
      allowFailure: true
    })

    if (/\ntrue\b/.test(evalResult.output) || evalResult.output.trim() === 'true') {
      observed = true
      break
    }

    await sleep(2000)
  }

  const shot = runPw(runner, ['screenshot'])
  const traceStop = runPw(runner, ['tracing-stop'], { allowFailure: true })

  const shotPath = extractLinkedPath(shot.output)
  if (shotPath) {
    copyArtifact(shotPath, path.join(screenshotsDir, 'realtime-tab-b.png'))
  }

  for (const traceOutput of [traceStart.output, traceStop.output]) {
    const linkedPaths = traceOutput.match(/\((\.playwright-cli\/[^)]+)\)/g) ?? []
    for (const linkedPath of linkedPaths) {
      const clean = linkedPath.slice(1, -1)
      if (path.basename(clean) === 'resources') {
        continue
      }
      const destination = path.join(tracesDir, path.basename(clean))
      const sourceAbsolutePath = path.join(process.cwd(), clean)
      if (!existsSync(sourceAbsolutePath)) {
        continue
      }
      if (!lstatSync(sourceAbsolutePath).isFile()) {
        continue
      }
      if (!existsSync(destination)) {
        copyArtifact(clean, destination)
      }
    }
  }

  artifacts.push({
    name: 'realtime-two-tab',
    status: observed ? 'captured' : 'failed',
    detail: observed
      ? `Observed marker update on tab B for ${proofSlug}.`
      : `Did not observe marker update on tab B within timeout for ${proofSlug}.`,
    file: shotPath ? path.join(screenshotsDir, 'realtime-tab-b.png') : undefined
  })
}

async function main() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')
  ensureOutputDirs()

  const artifacts: ArtifactEntry[] = []
  let server: ChildProcessWithoutNullStreams | undefined

  try {
    if (!commandExists('npx')) {
      throw new Error('npx is required for playwright-cli execution.')
    }

    const runner = findPwCommand()
    runPw(runner, ['install-browser'], { allowFailure: true })

    server = startDevServer()
    await waitForServer(`${baseUrl}/`)

    runPw(runner, ['open', `${baseUrl}/`])

    await captureRouteScreenshot(runner, '/', 'home', artifacts)
    await captureRouteScreenshot(runner, '/spaces/arkiv-demo', 'space', artifacts)
    await captureRouteScreenshot(runner, '/spaces/arkiv-demo/getting-started', 'page', artifacts)
    await captureRouteScreenshot(runner, '/spaces/arkiv-demo/settings', 'settings', artifacts)
    await captureRouteScreenshot(runner, '/spaces/arkiv-demo?parent=child', 'hierarchy', artifacts)
    await captureRouteScreenshot(runner, '/spaces/arkiv-demo/getting-started', 'ownership-transfer', artifacts)
    await captureRouteScreenshot(
      runner,
      '/search/pages?status=published&parent=root&sort=title_asc',
      'global-search',
      artifacts
    )

    await runRealtimeTwoTabScenario(runner, artifacts)

    runPw(runner, ['close-all'], { allowFailure: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    artifacts.push({
      name: 'capture-evidence',
      status: 'failed',
      detail: message
    })

    if (!failSoft) {
      throw error
    }
  } finally {
    stopDevServer(server)
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    artifacts
  }
  writeFileSync(reportFile, JSON.stringify(report, null, 2))

  const indexLines = [
    '# Evidence Artifact Index',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '| Artifact | Status | Detail | File |',
    '|---|---|---|---|',
    ...artifacts.map((item) => `| ${item.name} | ${item.status} | ${item.detail.replace(/\|/g, '\\|')} | ${item.file ?? '-'} |`)
  ]
  writeFileSync(indexFile, `${indexLines.join('\n')}\n`)

  const failedCount = artifacts.filter((item) => item.status === 'failed').length
  if (failedCount > 0 && !failSoft) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  if (failSoft) {
    process.exit(0)
  }
  process.exit(1)
})
