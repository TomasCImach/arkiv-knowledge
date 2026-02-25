import { NextResponse } from 'next/server'
import { getArkivConfig } from '@/arkiv/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const config = getArkivConfig()
  const rpcUrl = config.rpcUrl ?? config.chain.rpcUrls.default.http[0]

  try {
    const upstream = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      cache: 'no-store'
    })

    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json'
      }
    })
  } catch {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: 'Arkiv RPC proxy unavailable'
        }
      },
      { status: 503 }
    )
  }
}
