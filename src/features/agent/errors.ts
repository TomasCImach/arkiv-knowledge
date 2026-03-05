import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { AgentApiError, AgentErrorCode } from '@/features/agent/types'

export class AgentApiRequestError extends Error {
  code: AgentErrorCode
  status: number
  details?: Record<string, string | number | boolean>

  constructor(
    code: AgentErrorCode,
    message: string,
    status: number,
    details?: Record<string, string | number | boolean>
  ) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }
}

export function toAgentApiError(error: unknown): { status: number; body: AgentApiError } {
  if (error instanceof AgentApiRequestError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      }
    }
  }

  if (error instanceof ZodError) {
    const issue = error.issues[0]
    return {
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: issue?.message ?? 'Invalid request payload.',
          details: issue
            ? {
                path: issue.path.join('.') || 'body'
              }
            : undefined
        }
      }
    }
  }

  const message =
    process.env.NODE_ENV !== 'production' && error instanceof Error && error.message
      ? error.message
      : 'Unhandled agent API error.'

  return {
    status: 500,
    body: {
      error: {
        code: 'UPSTREAM_ERROR',
        message
      }
    }
  }
}

export function jsonAgentError(error: unknown): NextResponse<AgentApiError> {
  const normalized = toAgentApiError(error)
  return NextResponse.json(normalized.body, { status: normalized.status })
}

export function jsonAgentData<T>(data: T, status = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status })
}
