import type { Hex } from 'viem'

export const KB_SCHEMA_VERSION = '1'

export const ENTITY_TYPES = {
  space: 'kb.space',
  page: 'kb.page',
  revision: 'kb.revision',
  link: 'kb.link',
  presence: 'kb.presence'
} as const

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES]

export type SpaceVisibility = 'public' | 'unlisted' | 'private'
export type SpaceStatus = 'active' | 'archived'
export type PageStatus = 'draft' | 'published' | 'archived'

export type ExpirationKind =
  | 'space'
  | 'pagePublished'
  | 'pageDraft'
  | 'revision'
  | 'link'
  | 'presence'

export type SpacePayload = {
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type PagePayload = {
  title: string
  bodyMarkdown: string
  summary: string
  createdAt: string
  updatedAt: string
}

export type RevisionPayload = {
  title: string
  bodyMarkdown: string
  editSummary: string
}

export type LinkPayload = {
  sourceSlug: string
  targetSlug: string
}

export type PresencePayload = {
  displayName: string
  joinedAt: string
}

export type ParsedSpace = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  spaceSlug: string
  visibility: SpaceVisibility
  status: SpaceStatus
  updatedAtMs: number
  payload: SpacePayload
}

export type ParsedPage = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  spaceKey: Hex
  spaceSlug: string
  pageSlug: string
  title: string
  status: PageStatus
  parentPageKey?: Hex
  updatedAtMs: number
  payload: PagePayload
}

export type ParsedRevision = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  spaceKey: Hex
  pageKey: Hex
  revisionNo: number
  editedAtMs: number
  editor: Hex
  payload: RevisionPayload
}

export type ParsedLink = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  spaceKey: Hex
  fromPageKey: Hex
  toPageKey: Hex
  updatedAtMs: number
  payload: LinkPayload
}

export type ParsedPresence = {
  entityKey: Hex
  owner: Hex | undefined
  expiresAtBlock: bigint | undefined
  spaceKey: Hex
  pageKey: Hex
  viewer: Hex
  sessionId: string
  payload: PresencePayload
}

export type PageParentMode = 'all' | 'root' | 'child'
export type PageSortMode = 'updated_desc' | 'updated_asc' | 'title_asc'

export type PageSearchInput = {
  spaceKey?: Hex
  spaceSlug: string
  status?: PageStatus
  q?: string
  owner?: Hex
  parentMode?: PageParentMode
  sort?: PageSortMode
}

export type GlobalPageSearchInput = {
  spaceKey?: Hex
  spaceSlug?: string
  status?: PageStatus
  q?: string
  owner?: Hex
  parentMode?: PageParentMode
  sort?: PageSortMode
}
