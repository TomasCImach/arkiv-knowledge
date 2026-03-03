import { describe, expect, it, vi } from 'vitest'
import { transferPageOwnership } from '@/arkiv/mutations/pages'
import { transferEntityOwnership } from '@/arkiv/mutations/ownership'
import { transferSpaceOwnership } from '@/arkiv/mutations/spaces'

describe('ownership transfer mutation contract', () => {
  it('forwards entityKey/newOwner through changeOwnership', async () => {
    const changeOwnership = vi.fn().mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })

    const result = await transferEntityOwnership(
      {
        changeOwnership
      } as never,
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0x1111111111111111111111111111111111111111'
    )

    expect(changeOwnership).toHaveBeenCalledTimes(1)
    expect(changeOwnership).toHaveBeenCalledWith({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      newOwner: '0x1111111111111111111111111111111111111111'
    })
    expect(result.txHash).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
  })

  it('exposes space/page ownership wrappers over transferEntityOwnership', async () => {
    const changeOwnership = vi.fn().mockResolvedValue({
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
    const client = {
      changeOwnership
    } as never

    await transferSpaceOwnership(
      client,
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0x2222222222222222222222222222222222222222'
    )
    await transferPageOwnership(
      client,
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      '0x3333333333333333333333333333333333333333'
    )

    expect(changeOwnership).toHaveBeenNthCalledWith(1, {
      entityKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      newOwner: '0x2222222222222222222222222222222222222222'
    })
    expect(changeOwnership).toHaveBeenNthCalledWith(2, {
      entityKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      newOwner: '0x3333333333333333333333333333333333333333'
    })
  })
})
