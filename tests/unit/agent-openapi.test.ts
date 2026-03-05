import { describe, expect, it } from 'vitest'
import { buildAgentOpenApiDocument } from '@/features/agent/openapi'

describe('agent openapi document', () => {
  it('includes all required agent API paths', () => {
    const document = buildAgentOpenApiDocument()
    const paths = Object.keys(document.paths)

    expect(paths).toEqual(
      expect.arrayContaining([
        '/api/agent/v1/meta',
        '/api/agent/v1/openapi',
        '/api/agent/v1/auth/session',
        '/api/agent/v1/spaces',
        '/api/agent/v1/spaces/{spaceSlug}',
        '/api/agent/v1/spaces/{spaceSlug}/pages',
        '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}',
        '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/revisions',
        '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/backlinks',
        '/api/agent/v1/search/pages',
        '/api/agent/v1/intents/spaces/create',
        '/api/agent/v1/intents/spaces/update',
        '/api/agent/v1/intents/spaces/transfer',
        '/api/agent/v1/intents/pages/create',
        '/api/agent/v1/intents/pages/update',
        '/api/agent/v1/intents/pages/archive',
        '/api/agent/v1/intents/pages/delete',
        '/api/agent/v1/intents/pages/transfer',
        '/api/agent/v1/intents/entities/extend',
        '/api/agent/v1/presence/join',
        '/api/agent/v1/presence/renew',
        '/api/agent/v1/presence/leave'
      ])
    )
  })
})
