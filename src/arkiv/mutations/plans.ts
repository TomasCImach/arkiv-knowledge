import type {
  ChangeOwnershipParameters,
  CreateEntityParameters,
  ExtendEntityParameters,
  MutateEntitiesParameters,
  UpdateEntityParameters
} from '@arkiv-network/sdk'
import type { Hex } from 'viem'
import { EXPIRATION_SECONDS, buildLinkCreateEntity, buildPageCreateEntity, buildPageUpdateEntity, buildRevisionCreateEntity, buildSpaceCreateEntity, buildSpaceUpdateEntity } from '@/arkiv/schema'
import { listBacklinks, listOutgoingLinks } from '@/arkiv/queries/links'
import { getPageBySlugInSpace, listRevisionsByPage } from '@/arkiv/queries/pages'
import { listPresenceForPage } from '@/arkiv/queries/presence'
import { getSpaceBySlug } from '@/arkiv/queries/spaces'
import type { PageStatus, SpaceStatus, SpaceVisibility } from '@/arkiv/types'
import { normalizeGitBookMarkdown } from '@/features/migration/gitbook-markdown'
import { extractWikiLinks, tokenizeForSearch } from '@/lib/text'
import { nowIso, nowMs } from '@/lib/time'

export type CreateSpacePlanInput = {
  spaceSlug: string
  name: string
  description: string
  visibility: SpaceVisibility
  status?: SpaceStatus
}

export type UpdateSpacePlanInput = {
  spaceSlug: string
  name: string
  description: string
  visibility: SpaceVisibility
  status?: SpaceStatus
  createdAt: string
}

export type SavePagePlanInput = {
  spaceKey: Hex
  spaceSlug: string
  pageSlug: string
  title: string
  bodyMarkdown: string
  summary: string
  status: PageStatus
  editor: Hex
  parentPageKey?: Hex
}

export type EditPagePlanInput = SavePagePlanInput & {
  pageKey: Hex
  editSummary: string
  createdAt?: string
}

export type ArchivePagePlanInput = {
  spaceKey: Hex
  spaceSlug: string
  pageKey: Hex
  pageSlug: string
  title: string
  bodyMarkdown: string
  summary: string
  editor: Hex
  parentPageKey?: Hex
  createdAt?: string
  editSummary?: string
}

export type DeletePagePlan = {
  params: MutateEntitiesParameters
  deletedKeys: Hex[]
  deletedCounts: {
    revisions: number
    links: number
    presence: number
  }
}

export type CreatePagePrimaryPlan = {
  params: CreateEntityParameters
  normalizedBodyMarkdown: string
}

function buildSearchTokens(title: string, summary: string, bodyMarkdown: string): string[] {
  return tokenizeForSearch(`${title} ${summary} ${bodyMarkdown}`).slice(0, 20)
}

export async function buildCreateSpaceParams(input: CreateSpacePlanInput): Promise<CreateEntityParameters> {
  const existingSpace = await getSpaceBySlug(input.spaceSlug)
  if (existingSpace) {
    throw new Error(`Space slug "${input.spaceSlug}" already exists. Choose a different slug.`)
  }

  const timestamp = nowIso()
  const updatedAtMs = nowMs()

  return buildSpaceCreateEntity({
    spaceSlug: input.spaceSlug,
    visibility: input.visibility,
    status: input.status ?? 'active',
    updatedAtMs,
    payload: {
      name: input.name,
      description: input.description,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  })
}

export function buildUpdateSpaceParams(entityKey: Hex, input: UpdateSpacePlanInput): UpdateEntityParameters {
  const timestamp = nowIso()
  const updatedAtMs = nowMs()

  return buildSpaceUpdateEntity(entityKey, {
    spaceSlug: input.spaceSlug,
    visibility: input.visibility,
    status: input.status ?? 'active',
    updatedAtMs,
    payload: {
      name: input.name,
      description: input.description,
      createdAt: input.createdAt,
      updatedAt: timestamp
    }
  })
}

export function buildTransferOwnershipParams(entityKey: Hex, newOwner: Hex): ChangeOwnershipParameters {
  return {
    entityKey,
    newOwner
  }
}

export function buildExtendEntityParams(entityKey: Hex, kind: 'space' | 'page' | 'revision'): ExtendEntityParameters {
  const extensionSecondsByKind = {
    space: EXPIRATION_SECONDS.space,
    page: EXPIRATION_SECONDS.pagePublished,
    revision: EXPIRATION_SECONDS.revision
  } as const

  return {
    entityKey,
    expiresIn: extensionSecondsByKind[kind]
  }
}

export async function buildCreatePagePrimaryParams(input: SavePagePlanInput): Promise<CreatePagePrimaryPlan> {
  const existingPage = await getPageBySlugInSpace(input.spaceKey, input.pageSlug)
  if (existingPage) {
    throw new Error(`Page slug "${input.pageSlug}" already exists in this space. Choose a different slug.`)
  }

  const normalizedBodyMarkdown = normalizeGitBookMarkdown(input.bodyMarkdown).markdown
  const timestamp = nowIso()
  const updatedAtMs = nowMs()
  const searchTokens = buildSearchTokens(input.title, input.summary, normalizedBodyMarkdown)

  const params = buildPageCreateEntity({
    spaceKey: input.spaceKey,
    spaceSlug: input.spaceSlug,
    pageSlug: input.pageSlug,
    title: input.title,
    status: input.status,
    parentPageKey: input.parentPageKey,
    updatedAtMs,
    payload: {
      title: input.title,
      bodyMarkdown: normalizedBodyMarkdown,
      summary: input.summary,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    searchTokens
  })

  return {
    params,
    normalizedBodyMarkdown
  }
}

async function resolveLinkTargetPages(spaceKey: Hex, targetSlugs: string[]) {
  const resolved = await Promise.all(
    targetSlugs.map(async (targetSlug) => {
      const page = await getPageBySlugInSpace(spaceKey, targetSlug)
      if (!page) {
        return null
      }

      return {
        slug: targetSlug,
        key: page.entityKey
      }
    })
  )

  return resolved.filter((entry): entry is { slug: string; key: Hex } => entry !== null)
}

export type BuildCreatePageFollowUpInput = {
  spaceKey: Hex
  pageKey: Hex
  pageSlug: string
  title: string
  summary: string
  normalizedBodyMarkdown: string
  editor: Hex
}

export async function buildCreatePageFollowUpMutateParams(input: BuildCreatePageFollowUpInput): Promise<MutateEntitiesParameters> {
  const updatedAtMs = nowMs()
  const revisionCreate = buildRevisionCreateEntity({
    spaceKey: input.spaceKey,
    pageKey: input.pageKey,
    revisionNo: 1,
    editedAtMs: updatedAtMs,
    editor: input.editor,
    payload: {
      title: input.title,
      bodyMarkdown: input.normalizedBodyMarkdown,
      editSummary: 'Initial version'
    }
  })

  const links = await buildLinkCreatesForBody({
    spaceKey: input.spaceKey,
    fromPageKey: input.pageKey,
    fromPageSlug: input.pageSlug,
    bodyMarkdown: input.normalizedBodyMarkdown
  })

  return {
    creates: [revisionCreate, ...links]
  }
}

export async function buildEditPageMutateParams(input: EditPagePlanInput): Promise<MutateEntitiesParameters> {
  const normalizedBodyMarkdown = normalizeGitBookMarkdown(input.bodyMarkdown).markdown
  const timestamp = nowIso()
  const updatedAtMs = nowMs()
  const searchTokens = buildSearchTokens(input.title, input.summary, normalizedBodyMarkdown)

  const [revisions, existingPage] = await Promise.all([
    listRevisionsByPage(input.pageKey),
    getPageBySlugInSpace(input.spaceKey, input.pageSlug)
  ])
  const highestRevisionNo = revisions.reduce((max, revision) => Math.max(max, revision.revisionNo), 0)
  const nextRevision = highestRevisionNo + 1
  const createdAt = existingPage?.payload.createdAt ?? input.createdAt ?? timestamp

  const pageUpdate = buildPageUpdateEntity(input.pageKey, {
    spaceKey: input.spaceKey,
    spaceSlug: input.spaceSlug,
    pageSlug: input.pageSlug,
    title: input.title,
    status: input.status,
    parentPageKey: input.parentPageKey,
    updatedAtMs,
    payload: {
      title: input.title,
      bodyMarkdown: normalizedBodyMarkdown,
      summary: input.summary,
      createdAt,
      updatedAt: timestamp
    },
    searchTokens
  })

  const revisionCreate = buildRevisionCreateEntity({
    spaceKey: input.spaceKey,
    pageKey: input.pageKey,
    revisionNo: nextRevision,
    editedAtMs: updatedAtMs,
    editor: input.editor,
    payload: {
      title: input.title,
      bodyMarkdown: normalizedBodyMarkdown,
      editSummary: input.editSummary
    }
  })

  const outgoingLinks = await listOutgoingLinks(input.pageKey)
  const newLinkCreates = await buildLinkCreatesForBody({
    spaceKey: input.spaceKey,
    fromPageKey: input.pageKey,
    fromPageSlug: input.pageSlug,
    bodyMarkdown: normalizedBodyMarkdown
  })

  return {
    updates: [pageUpdate],
    creates: [revisionCreate, ...newLinkCreates],
    deletes: outgoingLinks.map((link) => ({ entityKey: link.entityKey }))
  }
}

export async function buildArchivePageMutateParams(input: ArchivePagePlanInput): Promise<MutateEntitiesParameters> {
  return buildEditPageMutateParams({
    spaceKey: input.spaceKey,
    spaceSlug: input.spaceSlug,
    pageKey: input.pageKey,
    pageSlug: input.pageSlug,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    summary: input.summary,
    status: 'archived',
    editor: input.editor,
    parentPageKey: input.parentPageKey,
    createdAt: input.createdAt,
    editSummary: input.editSummary ?? 'Archived page'
  })
}

export async function buildDeletePageWithCleanupPlan(pageKey: Hex): Promise<DeletePagePlan> {
  const [revisions, outgoingLinks, incomingLinks, presenceRecords] = await Promise.all([
    listRevisionsByPage(pageKey),
    listOutgoingLinks(pageKey),
    listBacklinks(pageKey),
    listPresenceForPage(pageKey)
  ])

  const uniqueKeys = new Set<Hex>([
    pageKey,
    ...revisions.map((revision) => revision.entityKey),
    ...outgoingLinks.map((link) => link.entityKey),
    ...incomingLinks.map((link) => link.entityKey),
    ...presenceRecords.map((presence) => presence.entityKey)
  ])
  const deletedKeys = Array.from(uniqueKeys)

  return {
    params: {
      deletes: deletedKeys.map((entityKey) => ({ entityKey }))
    },
    deletedKeys,
    deletedCounts: {
      revisions: revisions.length,
      links: outgoingLinks.length + incomingLinks.length,
      presence: presenceRecords.length
    }
  }
}

type BuildLinkCreatesForBodyInput = {
  spaceKey: Hex
  fromPageKey: Hex
  fromPageSlug: string
  bodyMarkdown: string
}

async function buildLinkCreatesForBody(input: BuildLinkCreatesForBodyInput) {
  const linkTargets = extractWikiLinks(input.bodyMarkdown)
  if (linkTargets.length === 0) {
    return []
  }

  const resolvedTargets = await resolveLinkTargetPages(input.spaceKey, linkTargets)
  const timestamp = nowMs()

  return resolvedTargets.map((target) =>
    buildLinkCreateEntity({
      spaceKey: input.spaceKey,
      fromPageKey: input.fromPageKey,
      toPageKey: target.key,
      updatedAtMs: timestamp,
      payload: {
        sourceSlug: input.fromPageSlug,
        targetSlug: target.slug
      }
    })
  )
}
