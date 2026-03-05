import type { ParsedLink, ParsedPage, ParsedPresence, ParsedRevision, ParsedSpace } from '@/arkiv/types'

function blockToString(value: bigint | undefined): string | null {
  return value !== undefined ? value.toString() : null
}

export function toSpaceDto(space: ParsedSpace) {
  return {
    entityKey: space.entityKey,
    owner: space.owner ?? null,
    expiresAtBlock: blockToString(space.expiresAtBlock),
    spaceSlug: space.spaceSlug,
    visibility: space.visibility,
    status: space.status,
    updatedAtMs: space.updatedAtMs,
    payload: space.payload
  }
}

export function toPageDto(page: ParsedPage) {
  return {
    entityKey: page.entityKey,
    owner: page.owner ?? null,
    expiresAtBlock: blockToString(page.expiresAtBlock),
    spaceKey: page.spaceKey,
    spaceSlug: page.spaceSlug,
    pageSlug: page.pageSlug,
    title: page.title,
    status: page.status,
    parentPageKey: page.parentPageKey ?? null,
    updatedAtMs: page.updatedAtMs,
    payload: page.payload
  }
}

export function toRevisionDto(revision: ParsedRevision) {
  return {
    entityKey: revision.entityKey,
    owner: revision.owner ?? null,
    expiresAtBlock: blockToString(revision.expiresAtBlock),
    spaceKey: revision.spaceKey,
    pageKey: revision.pageKey,
    revisionNo: revision.revisionNo,
    editedAtMs: revision.editedAtMs,
    editor: revision.editor,
    payload: revision.payload
  }
}

export function toLinkDto(link: ParsedLink) {
  return {
    entityKey: link.entityKey,
    owner: link.owner ?? null,
    expiresAtBlock: blockToString(link.expiresAtBlock),
    spaceKey: link.spaceKey,
    fromPageKey: link.fromPageKey,
    toPageKey: link.toPageKey,
    updatedAtMs: link.updatedAtMs,
    payload: link.payload
  }
}

export function toPresenceDto(presence: ParsedPresence) {
  return {
    entityKey: presence.entityKey,
    owner: presence.owner ?? null,
    expiresAtBlock: blockToString(presence.expiresAtBlock),
    spaceKey: presence.spaceKey,
    pageKey: presence.pageKey,
    viewer: presence.viewer,
    sessionId: presence.sessionId,
    payload: presence.payload
  }
}
