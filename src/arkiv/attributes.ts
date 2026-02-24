import type { Attribute } from '@arkiv-network/sdk'

export function attributeValue(attributes: Attribute[], key: string): string | number | undefined {
  const match = attributes.find((attribute) => attribute.key === key)
  return match?.value
}

export function hasAttribute(attributes: Attribute[], key: string, value: string | number): boolean {
  return attributes.some((attribute) => attribute.key === key && attribute.value === value)
}
