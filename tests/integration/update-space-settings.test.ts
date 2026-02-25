import { describe, expect, it, vi } from 'vitest'
import { updateSpace } from '@/arkiv/mutations/spaces'

function decodeJsonPayload(payload: Uint8Array): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>
}

function findAttr(
  attributes: Array<{ key: string; value: string | number }>,
  key: string
): string | number | undefined {
  return attributes.find((attribute) => attribute.key === key)?.value
}

describe('updateSpace mutation contract', () => {
  it('preserves createdAt while refreshing updatedAt and updatedAtMs', async () => {
    const updateEntity = vi.fn().mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })

    const result = await updateSpace(
      {
        updateEntity
      } as never,
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      {
        spaceSlug: 'arkiv-demo',
        name: 'Arkiv Demo',
        description: 'Updated description',
        visibility: 'public',
        status: 'active',
        createdAt: '2026-02-24T10:00:00.000Z'
      }
    )

    expect(result.txHash).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    expect(updateEntity).toHaveBeenCalledTimes(1)

    const [input] = updateEntity.mock.calls[0]
    const payload = decodeJsonPayload(input.payload)

    expect(payload.createdAt).toBe('2026-02-24T10:00:00.000Z')
    expect(typeof payload.updatedAt).toBe('string')
    expect(payload.updatedAt).not.toBe(payload.createdAt)
    expect(findAttr(input.attributes, 'spaceSlug')).toBe('arkiv-demo')
    expect(findAttr(input.attributes, 'type')).toBe('kb.space')
    expect(findAttr(input.attributes, 'updatedAtMs')).toEqual(expect.any(Number))
  })
})
