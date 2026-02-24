import type { Hex } from 'viem'

export function canExtendOwnedEntity(owner: Hex | undefined, connectedAddress: Hex | undefined): boolean {
  if (!owner || !connectedAddress) {
    return false
  }

  return owner.toLowerCase() === connectedAddress.toLowerCase()
}
