export function equalAddress(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) {
    return false
  }

  return a.toLowerCase() === b.toLowerCase()
}

export function canManageOwnedEntity(owner: string | undefined, connectedAddress: string | undefined): boolean {
  return equalAddress(owner, connectedAddress)
}
