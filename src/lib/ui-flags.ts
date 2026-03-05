function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export function isTechnicalDetailsUiEnabled(): boolean {
  const rawValue =
    process.env.NEXT_PUBLIC_ARKIV_SHOW_TECHNICAL_DETAILS_UI ??
    process.env.ARKIV_SHOW_TECHNICAL_DETAILS_UI

  return parseBooleanEnv(rawValue)
}
