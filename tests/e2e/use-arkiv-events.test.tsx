import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useArkivEvents } from '@/arkiv/events/useArkivEvents'

const mocks = vi.hoisted(() => ({
  subscribeEntityEventsMock: vi.fn(),
  getEntityMock: vi.fn(),
  onRelevantEventMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  handlers: undefined as
    | {
        onEntityCreated: (event: { entityKey: `0x${string}` }) => void
        onEntityUpdated: (event: { entityKey: `0x${string}` }) => void
        onEntityDeleted: () => void
        onEntityExpired: () => void
        onEntityExpiresInExtended: (event: { entityKey: `0x${string}` }) => void
        onError: () => void
      }
    | undefined
}))

vi.mock('@/arkiv/clients', () => ({
  getArkivPublicClient: () => ({
    subscribeEntityEvents: mocks.subscribeEntityEventsMock,
    getEntity: mocks.getEntityMock
  })
}))

vi.mock('@/arkiv/attributes', () => ({
  attributeValue: (attributes: Record<string, string> | undefined, key: string) => attributes?.[key] ?? ''
}))

function Harness({
  spaceKey,
  pageKey,
  fallbackPollMs = 1000
}: {
  spaceKey?: `0x${string}`
  pageKey?: `0x${string}`
  fallbackPollMs?: number
}) {
  useArkivEvents({
    onRelevantEvent: mocks.onRelevantEventMock,
    spaceKey,
    pageKey,
    fallbackPollMs
  })
  return null
}

describe('useArkivEvents realtime behavior', () => {
  beforeEach(() => {
    vi.useRealTimers()
    mocks.subscribeEntityEventsMock.mockReset()
    mocks.getEntityMock.mockReset()
    mocks.onRelevantEventMock.mockReset()
    mocks.unsubscribeMock.mockReset()
    mocks.handlers = undefined

    mocks.subscribeEntityEventsMock.mockImplementation(async (handlers) => {
      mocks.handlers = handlers
      return mocks.unsubscribeMock
    })
    mocks.getEntityMock.mockResolvedValue({
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      attributes: {}
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refreshes when event entity matches requested space and page', async () => {
    const spaceKey = '0x1111111111111111111111111111111111111111111111111111111111111111'
    const pageKey = '0x2222222222222222222222222222222222222222222222222222222222222222'
    mocks.getEntityMock.mockResolvedValueOnce({
      key: pageKey,
      attributes: {
        spaceKey,
        pageKey
      }
    })

    render(<Harness spaceKey={spaceKey} pageKey={pageKey} />)
    await vi.waitFor(() => expect(mocks.handlers).toBeDefined())

    await act(async () => {
      await mocks.handlers?.onEntityUpdated({
        entityKey: '0x3333333333333333333333333333333333333333333333333333333333333333'
      })
    })

    expect(mocks.onRelevantEventMock).toHaveBeenCalledTimes(1)
  })

  it('ignores unrelated entity events', async () => {
    const spaceKey = '0x1111111111111111111111111111111111111111111111111111111111111111'
    const pageKey = '0x2222222222222222222222222222222222222222222222222222222222222222'
    mocks.getEntityMock.mockResolvedValueOnce({
      key: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      attributes: {
        spaceKey: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        pageKey: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
      }
    })

    render(<Harness spaceKey={spaceKey} pageKey={pageKey} />)
    await vi.waitFor(() => expect(mocks.handlers).toBeDefined())

    await act(async () => {
      await mocks.handlers?.onEntityCreated({
        entityKey: '0x4444444444444444444444444444444444444444444444444444444444444444'
      })
    })

    expect(mocks.onRelevantEventMock).not.toHaveBeenCalled()
  })

  it('starts fallback polling when subscription emits onError', async () => {
    vi.useFakeTimers()
    render(<Harness fallbackPollMs={100} />)
    await vi.waitFor(() => expect(mocks.handlers).toBeDefined())

    await act(async () => {
      mocks.handlers?.onError()
      await vi.advanceTimersByTimeAsync(260)
    })

    expect(mocks.onRelevantEventMock).toHaveBeenCalled()
  })

  it('falls back to polling when subscription setup fails', async () => {
    vi.useFakeTimers()
    mocks.subscribeEntityEventsMock.mockRejectedValueOnce(new Error('subscription unavailable'))

    render(<Harness fallbackPollMs={120} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(360)
    })

    expect(mocks.onRelevantEventMock).toHaveBeenCalled()
  })
})
