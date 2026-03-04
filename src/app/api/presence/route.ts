import { NextResponse } from 'next/server'
import type { Hex } from 'viem'
import { isAddress, isHex } from 'viem'
import { z } from 'zod'
import {
  heartbeatPresenceWithServerSigner,
  joinPresenceWithServerSigner,
  leavePresenceWithServerSigner
} from '@/arkiv/mutations/presence-server'

function isEntityKey(value: string): boolean {
  return isHex(value, { strict: true }) && value.length === 66
}

const hexEntityKeySchema = z.string().refine((value) => isEntityKey(value), {
  message: 'Expected a 32-byte entity key.'
})

const walletAddressSchema = z.string().refine((value) => isAddress(value), {
  message: 'Expected a valid wallet address.'
})

const joinPresenceSchema = z.object({
  spaceKey: hexEntityKeySchema,
  pageKey: hexEntityKeySchema,
  viewer: walletAddressSchema,
  sessionId: z.string().trim().min(1).max(160),
  displayName: z.string().trim().min(1).max(120)
})

const presenceEntitySchema = z.object({
  entityKey: hexEntityKeySchema
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

class PresenceRequestError extends Error {}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback
  }

  if (error instanceof PresenceRequestError) {
    return error.message || fallback
  }

  if (process.env.NODE_ENV !== 'production' && error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function errorStatus(error: unknown): number {
  if (error instanceof z.ZodError || error instanceof PresenceRequestError) {
    return 400
  }

  return 500
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new PresenceRequestError('Invalid JSON body.')
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request)
    const input = joinPresenceSchema.parse(body)
    const result = await joinPresenceWithServerSigner({
      spaceKey: input.spaceKey as Hex,
      pageKey: input.pageKey as Hex,
      viewer: input.viewer as Hex,
      sessionId: input.sessionId,
      displayName: input.displayName
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, 'Could not create presence.') },
      { status: errorStatus(error) }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await readJsonBody(request)
    const input = presenceEntitySchema.parse(body)
    const result = await heartbeatPresenceWithServerSigner(input.entityKey as Hex)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, 'Could not renew presence.') },
      { status: errorStatus(error) }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await readJsonBody(request)
    const input = presenceEntitySchema.parse(body)
    const result = await leavePresenceWithServerSigner(input.entityKey as Hex)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, 'Could not leave presence.') },
      { status: errorStatus(error) }
    )
  }
}
