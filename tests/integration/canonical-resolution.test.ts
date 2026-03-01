import { describe, expect, it } from 'vitest'
import { getPageBySlug } from '@/arkiv/queries/pages'
import { getSpaceBySlug } from '@/arkiv/queries/spaces'

type Attribute = { key: string; value: string | number }

function makeEntity(input: {
  key: `0x${string}`
  owner?: `0x${string}`
  attributes: Attribute[]
  payload: Record<string, unknown>
}) {
  return {
    key: input.key,
    owner: input.owner,
    expiresAtBlock: 1000n,
    attributes: input.attributes,
    toJson: () => input.payload
  }
}

function makeQueryClient(entities: Array<ReturnType<typeof makeEntity>>) {
  const builder = {
    withAttributes: () => builder,
    withPayload: () => builder,
    withMetadata: () => builder,
    where: () => builder,
    orderBy: () => builder,
    fetch: async () => ({ entities })
  }

  return {
    buildQuery: () => builder
  }
}

describe('canonical entity resolution', () => {
  it('selects the most recently updated space when slug collisions exist', async () => {
    const client = makeQueryClient([
      makeEntity({
        key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        attributes: [
          { key: 'type', value: 'kb.space' },
          { key: 'schemaVersion', value: '1' },
          { key: 'spaceSlug', value: 'arkiv-demo' },
          { key: 'visibility', value: 'public' },
          { key: 'status', value: 'active' },
          { key: 'updatedAtMs', value: 100 }
        ],
        payload: {
          name: 'Old Space',
          description: 'Old',
          createdAt: '2026-02-20T00:00:00.000Z',
          updatedAt: '2026-02-20T00:00:00.000Z'
        }
      }),
      makeEntity({
        key: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        attributes: [
          { key: 'type', value: 'kb.space' },
          { key: 'schemaVersion', value: '1' },
          { key: 'spaceSlug', value: 'arkiv-demo' },
          { key: 'visibility', value: 'public' },
          { key: 'status', value: 'active' },
          { key: 'updatedAtMs', value: 200 }
        ],
        payload: {
          name: 'New Space',
          description: 'New',
          createdAt: '2026-02-21T00:00:00.000Z',
          updatedAt: '2026-02-21T00:00:00.000Z'
        }
      })
    ])

    const space = await getSpaceBySlug('arkiv-demo', { client } as never)
    expect(space?.entityKey).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
  })

  it('selects the most recently updated page when slug collisions exist', async () => {
    const client = makeQueryClient([
      makeEntity({
        key: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        attributes: [
          { key: 'type', value: 'kb.page' },
          { key: 'schemaVersion', value: '1' },
          { key: 'spaceKey', value: '0x1111111111111111111111111111111111111111111111111111111111111111' },
          { key: 'spaceSlug', value: 'arkiv-demo' },
          { key: 'pageSlug', value: 'getting-started' },
          { key: 'title', value: 'Getting Started' },
          { key: 'status', value: 'published' },
          { key: 'updatedAtMs', value: 100 }
        ],
        payload: {
          title: 'Old Page',
          bodyMarkdown: 'Old',
          summary: 'Old',
          createdAt: '2026-02-20T00:00:00.000Z',
          updatedAt: '2026-02-20T00:00:00.000Z'
        }
      }),
      makeEntity({
        key: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        attributes: [
          { key: 'type', value: 'kb.page' },
          { key: 'schemaVersion', value: '1' },
          { key: 'spaceKey', value: '0x1111111111111111111111111111111111111111111111111111111111111111' },
          { key: 'spaceSlug', value: 'arkiv-demo' },
          { key: 'pageSlug', value: 'getting-started' },
          { key: 'title', value: 'Getting Started' },
          { key: 'status', value: 'published' },
          { key: 'updatedAtMs', value: 200 }
        ],
        payload: {
          title: 'New Page',
          bodyMarkdown: 'New',
          summary: 'New',
          createdAt: '2026-02-21T00:00:00.000Z',
          updatedAt: '2026-02-21T00:00:00.000Z'
        }
      })
    ])

    const page = await getPageBySlug('arkiv-demo', 'getting-started', { client } as never)
    expect(page?.entityKey).toBe('0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
  })
})
