import { NextResponse } from 'next/server'
import { getAuthenticatedViewerAddress } from '@/features/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const address = await getAuthenticatedViewerAddress()
  return NextResponse.json({ address: address ?? null }, { status: 200 })
}
