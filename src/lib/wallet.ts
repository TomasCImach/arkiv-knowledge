import type { Hex } from 'viem'
import { getArkivPublicClient } from '@/arkiv/clients'
import { getArkivConfig } from '@/arkiv/config'

type ErrorLike = {
  message?: unknown
  shortMessage?: unknown
  details?: unknown
  reason?: unknown
  metaMessages?: unknown
  cause?: unknown
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return ''
}

function collectErrorDetails(error: unknown, depth = 0): string[] {
  if (!error || depth > 4) {
    return []
  }

  const typed = error as ErrorLike
  const details: string[] = []

  const message = toText(typed.message)
  const shortMessage = toText(typed.shortMessage)
  const explicitDetails = toText(typed.details)
  const reason = toText(typed.reason)

  if (message) details.push(message)
  if (shortMessage) details.push(shortMessage)
  if (explicitDetails) details.push(explicitDetails)
  if (reason) details.push(reason)

  if (Array.isArray(typed.metaMessages)) {
    for (const entry of typed.metaMessages) {
      const text = toText(entry)
      if (text) {
        details.push(text)
      }
    }
  }

  if (typed.cause) {
    details.push(...collectErrorDetails(typed.cause, depth + 1))
  }

  return details
}

function normalizeDetail(detail: string): string {
  return detail.replace(/\s+/g, ' ').replace(/: undefined\b/gi, '').trim()
}

function isUsefulDetail(detail: string): boolean {
  const normalized = normalizeDetail(detail).toLowerCase()
  if (!normalized) {
    return false
  }

  if (normalized === 'transaction failed') {
    return false
  }

  if (normalized.endsWith('undefined')) {
    return false
  }

  return true
}

function friendlyHint(detail: string): string {
  const normalized = detail.toLowerCase()

  if (normalized.includes('insufficient funds')) {
    const config = getArkivConfig()
    return `Insufficient funds on ${config.chainName}. Fund your wallet and retry.`
  }

  if (normalized.includes('user rejected')) {
    return 'Transaction was rejected in your wallet.'
  }

  if (normalized.includes('wrong chain') || normalized.includes('chain mismatch')) {
    const config = getArkivConfig()
    return `Switch wallet network to ${config.chainName} and retry.`
  }

  return ''
}

export function formatWalletError(error: unknown, fallback = 'Transaction failed. Please try again.'): string {
  const rawDetails = collectErrorDetails(error).map(normalizeDetail)
  const details = rawDetails.filter(isUsefulDetail)

  const uniqueDetails = Array.from(new Set(details))
  const primary = uniqueDetails[0]

  const sawOpaqueTxFailure = rawDetails.some((detail) => detail.toLowerCase() === 'transaction failed')

  if (!primary) {
    if (sawOpaqueTxFailure) {
      const config = getArkivConfig()
      return `Transaction failed before Arkiv returned a reason. Verify ${config.chainName} network and wallet funding, then retry.`
    }

    return fallback
  }

  const hint = friendlyHint(primary)

  return hint ? `${primary} ${hint}` : primary
}

export function formatReadError(error: unknown, fallback = 'Arkiv read is temporarily unavailable.'): string {
  const details = collectErrorDetails(error)
    .map(normalizeDetail)
    .filter(isUsefulDetail)

  const primary = details[0]
  if (!primary) {
    return fallback
  }

  const normalized = primary.toLowerCase()
  if (
    normalized.includes('request took too long') ||
    normalized.includes('request timed out') ||
    normalized.includes('timeout')
  ) {
    return 'Arkiv RPC timed out. Please refresh and retry.'
  }

  const compact = primary
    .replace(/\\s+URL:.*$/i, '')
    .replace(/\\s+Request body:.*$/i, '')
    .replace(/\\s+Version:.*$/i, '')
    .trim()

  return compact || fallback
}

export type WritePreflightResult =
  | { ok: true }
  | { ok: false; message: string }

async function readProviderBalance(address: Hex): Promise<bigint | undefined> {
  if (typeof window === 'undefined') {
    return undefined
  }

  const provider = (window as Window & {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }).ethereum

  if (!provider) {
    return undefined
  }

  const result = await provider.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  })

  if (typeof result !== 'string' || result.length === 0) {
    return undefined
  }

  return BigInt(result)
}

export async function runWritePreflight(address: Hex, chainId: number | undefined): Promise<WritePreflightResult> {
  const config = getArkivConfig()

  if (!chainId) {
    return {
      ok: false,
      message: `Unable to determine wallet network. Switch to ${config.chainName}.`
    }
  }

  if (chainId !== config.chain.id) {
    return {
      ok: false,
      message: `Wrong network. Switch wallet to ${config.chainName} (chain id ${config.chain.id}).`
    }
  }

  let providerBalanceKnown = false
  try {
    const providerBalance = await readProviderBalance(address)
    if (providerBalance !== undefined) {
      providerBalanceKnown = true
      if (providerBalance <= 0n) {
        return {
          ok: false,
          message: `No ${config.chain.nativeCurrency.symbol} on ${config.chainName}. Fund wallet before writing.`
        }
      }
    }
  } catch {
    // Fall through to public-client balance check.
  }

  try {
    const balance = await getArkivPublicClient().getBalance({ address })

    if (balance <= 0n) {
      return {
        ok: false,
        message: `No ${config.chain.nativeCurrency.symbol} on ${config.chainName}. Fund wallet before writing.`
      }
    }
  } catch {
    if (!providerBalanceKnown) {
      return {
        ok: false,
        message: `Could not verify balance on ${config.chainName}. Check wallet network/RPC health and retry.`
      }
    }
  }

  return { ok: true }
}
