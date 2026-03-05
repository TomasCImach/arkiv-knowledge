export function buildAgentOpenApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Arklib Agent API',
      version: '1.0.0',
      description: 'Agent-friendly Arkiv-first API with deterministic reads and wallet-signed write intents.'
    },
    paths: {
      '/api/agent/v1/meta': {
        get: {
          summary: 'Read API metadata',
          responses: {
            '200': { description: 'Metadata envelope' }
          }
        }
      },
      '/api/agent/v1/openapi': {
        get: {
          summary: 'Read OpenAPI document',
          responses: {
            '200': { description: 'OpenAPI document' }
          }
        }
      },
      '/api/agent/v1/auth/session': {
        get: {
          summary: 'Read wallet auth session',
          responses: {
            '200': { description: 'Current session wallet address or null' }
          }
        }
      },
      '/api/agent/v1/spaces': {
        get: {
          summary: 'List public spaces',
          responses: {
            '200': { description: 'Space list' }
          }
        }
      },
      '/api/agent/v1/spaces/{spaceSlug}': {
        get: {
          summary: 'Read canonical space',
          parameters: [
            {
              in: 'path',
              name: 'spaceSlug',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': { description: 'Space entity' },
            '404': { description: 'Not found / not visible' }
          }
        }
      },
      '/api/agent/v1/spaces/{spaceSlug}/pages': {
        get: {
          summary: 'Search pages inside canonical space',
          parameters: [
            {
              in: 'path',
              name: 'spaceSlug',
              required: true,
              schema: { type: 'string' }
            },
            { in: 'query', name: 'q', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['draft', 'published', 'archived'] } },
            { in: 'query', name: 'parent', schema: { type: 'string', enum: ['all', 'root', 'child'] } },
            {
              in: 'query',
              name: 'sort',
              schema: { type: 'string', enum: ['updated_desc', 'updated_asc', 'title_asc'] }
            },
            { in: 'query', name: 'owner', schema: { type: 'string' } }
          ],
          responses: {
            '200': { description: 'Page list' }
          }
        }
      },
      '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}': {
        get: {
          summary: 'Read canonical page',
          parameters: [
            { in: 'path', name: 'spaceSlug', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'pageSlug', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': { description: 'Page entity' },
            '404': { description: 'Not found / not visible' }
          }
        }
      },
      '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/revisions': {
        get: {
          summary: 'List page revisions',
          responses: { '200': { description: 'Revision list' } }
        }
      },
      '/api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/backlinks': {
        get: {
          summary: 'List page backlinks',
          responses: { '200': { description: 'Backlink list' } }
        }
      },
      '/api/agent/v1/search/pages': {
        get: {
          summary: 'Global page search with visibility filtering',
          responses: { '200': { description: 'Page search result' } }
        }
      },
      '/api/agent/v1/intents/spaces/create': {
        post: {
          summary: 'Build create-space write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/spaces/update': {
        post: {
          summary: 'Build update-space write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/spaces/transfer': {
        post: {
          summary: 'Build transfer-space ownership intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/pages/create': {
        post: {
          summary: 'Build create-page write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/pages/update': {
        post: {
          summary: 'Build update-page write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/pages/archive': {
        post: {
          summary: 'Build archive-page write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/pages/delete': {
        post: {
          summary: 'Build delete-page write intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/pages/transfer': {
        post: {
          summary: 'Build transfer-page ownership intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/intents/entities/extend': {
        post: {
          summary: 'Build extend-entity expiration intent',
          responses: { '200': { description: 'Write intent' } }
        }
      },
      '/api/agent/v1/presence/join': {
        post: {
          summary: 'Join presence as authenticated viewer',
          responses: { '200': { description: 'Presence mutation result' } }
        }
      },
      '/api/agent/v1/presence/renew': {
        patch: {
          summary: 'Renew presence',
          responses: { '200': { description: 'Presence mutation result' } }
        }
      },
      '/api/agent/v1/presence/leave': {
        delete: {
          summary: 'Leave presence',
          responses: { '200': { description: 'Presence mutation result' } }
        }
      }
    },
    components: {
      schemas: {
        AgentApiError: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'string',
                  enum: [
                    'AUTH_REQUIRED',
                    'FORBIDDEN',
                    'NOT_FOUND',
                    'CONFLICT',
                    'VALIDATION_ERROR',
                    'UPSTREAM_ERROR'
                  ]
                },
                message: { type: 'string' },
                details: {
                  type: 'object',
                  additionalProperties: {
                    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }]
                  }
                }
              }
            }
          }
        },
        AgentWriteIntent: {
          type: 'object',
          required: ['operation', 'signer', 'sdkCall', 'postconditions'],
          properties: {
            operation: { type: 'string' },
            signer: { type: 'string' },
            sdkCall: { type: 'object' },
            followUpCalls: {
              type: 'array',
              items: { type: 'object' }
            },
            postconditions: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  }
}
