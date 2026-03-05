import { describe, expect, it, vi } from 'vitest'
import { executeAgentIntent } from '@/features/agent/execute-intent'
import type { AgentWriteIntent } from '@/features/agent/types'

const PAGE_KEY = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const TX_HASH_1 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const TX_HASH_2 = '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'

describe('executeAgentIntent', () => {
  it('executes follow-up calls with template substitution', async () => {
    const createEntity = vi.fn().mockResolvedValue({
      entityKey: PAGE_KEY,
      txHash: TX_HASH_1
    })
    const mutateEntities = vi.fn().mockResolvedValue({
      txHash: TX_HASH_2,
      createdEntities: ['0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'],
      updatedEntities: [],
      deletedEntities: [],
      ownershipChanges: [],
      extendedEntities: []
    })

    const client = {
      createEntity,
      mutateEntities
    } as never

    const intent: AgentWriteIntent = {
      operation: 'pages.create',
      signer: '0x1111111111111111111111111111111111111111',
      sdkCall: {
        method: 'createEntity',
        params: {
          payload: [],
          contentType: 'application/json',
          expiresIn: 3600,
          attributes: [{ key: 'type', value: 'kb.page' }]
        }
      },
      followUpCalls: [
        {
          method: 'mutateEntities',
          params: {
            creates: [
              {
                payload: [],
                contentType: 'application/json',
                expiresIn: 3600,
                attributes: [
                  { key: 'type', value: 'kb.revision' },
                  { key: 'pageKey', value: '{{primary.entityKey}}' }
                ]
              }
            ]
          }
        }
      ],
      postconditions: []
    }

    const result = await executeAgentIntent(client, intent)

    expect(createEntity).toHaveBeenCalledTimes(1)
    expect(mutateEntities).toHaveBeenCalledTimes(1)

    const mutateInput = mutateEntities.mock.calls[0][0]
    const pageKeyAttribute = mutateInput.creates[0].attributes.find((attribute: { key: string }) => attribute.key === 'pageKey')
    expect(pageKeyAttribute?.value).toBe(PAGE_KEY)

    expect(result.txHashes).toEqual([TX_HASH_1, TX_HASH_2])
    expect(result.primaryEntityKey).toBe(PAGE_KEY)
  })
})
