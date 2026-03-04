import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Hex } from 'viem'

const mocks = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  joinPresenceMock: vi.fn(),
  leavePresenceMock: vi.fn(),
  usePresenceHeartbeatMock: vi.fn(),
  accountState: {
    address: '0x1111111111111111111111111111111111111111' as `0x${string}` | undefined
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refreshMock
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: mocks.accountState.address
  })
}))

vi.mock('@/arkiv/mutations/presence', () => ({
  joinPresence: mocks.joinPresenceMock,
  leavePresence: mocks.leavePresenceMock
}))

vi.mock('@/features/presence/usePresenceHeartbeat', () => ({
  usePresenceHeartbeat: mocks.usePresenceHeartbeatMock
}))

import { PresencePanel } from '@/app/_components/presence-panel'

const JOINED_KEY = `0x${'a'.repeat(64)}` as Hex
const JOINED_HASH = `0x${'b'.repeat(64)}` as Hex
const SPACE_KEY = `0x${'c'.repeat(64)}` as Hex
const PAGE_KEY = `0x${'d'.repeat(64)}` as Hex

describe('presence panel auto lifecycle', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mocks.refreshMock.mockReset()
    mocks.joinPresenceMock.mockReset()
    mocks.leavePresenceMock.mockReset()
    mocks.usePresenceHeartbeatMock.mockReset()
    mocks.accountState.address = '0x1111111111111111111111111111111111111111'

    mocks.joinPresenceMock.mockResolvedValue({
      entityKey: JOINED_KEY,
      txHash: JOINED_HASH
    })
    mocks.leavePresenceMock.mockResolvedValue({
      entityKey: JOINED_KEY,
      txHash: JOINED_HASH
    })
  })

  it('auto-joins when wallet is connected and hides manual join/leave buttons', async () => {
    render(<PresencePanel spaceKey={SPACE_KEY} pageKey={PAGE_KEY} records={[]} />)

    await vi.waitFor(() => expect(mocks.joinPresenceMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('button', { name: 'Join Presence' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Leave' })).not.toBeInTheDocument()
  })

  it('auto-leaves when wallet disconnects after joining', async () => {
    const { rerender } = render(<PresencePanel spaceKey={SPACE_KEY} pageKey={PAGE_KEY} records={[]} />)

    await vi.waitFor(() => expect(mocks.joinPresenceMock).toHaveBeenCalledTimes(1))

    mocks.accountState.address = undefined
    rerender(<PresencePanel spaceKey={SPACE_KEY} pageKey={PAGE_KEY} records={[]} />)

    await vi.waitFor(() => {
      expect(mocks.leavePresenceMock).toHaveBeenCalledWith(JOINED_KEY)
    })
  })
})
