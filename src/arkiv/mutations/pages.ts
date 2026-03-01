import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { transferEntityOwnership } from '@/arkiv/mutations/ownership'
import { listOutgoingLinks } from '@/arkiv/queries/links'
import { getPageBySlugInSpace, listRevisionsByPage } from '@/arkiv/queries/pages'
import {
  buildLinkCreateEntity,
  buildPageCreateEntity,
  buildPageUpdateEntity,
  buildRevisionCreateEntity
} from '@/arkiv/schema'
import type { PageStatus } from '@/arkiv/types'
import { extractWikiLinks, tokenizeForSearch } from '@/lib/text'
import { nowIso, nowMs } from '@/lib/time'

export type SavePageInput = {
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

function buildSearchTokens(title: string, summary: string, bodyMarkdown: string): string[] {
  return tokenizeForSearch(`${title} ${summary} ${bodyMarkdown}`).slice(0, 20)
}

export async function createPage(client: ArkivWriteClient, input: SavePageInput): Promise<{ pageKey: Hex; txHash: Hex }> {
  const existingPage = await getPageBySlugInSpace(input.spaceKey, input.pageSlug)
  if (existingPage) {
    throw new Error(`Page slug "${input.pageSlug}" already exists in this space. Choose a different slug.`)
  }

  const timestamp = nowIso()
  const updatedAtMs = nowMs()
  const searchTokens = buildSearchTokens(input.title, input.summary, input.bodyMarkdown)

  const pageCreate = buildPageCreateEntity({
    spaceKey: input.spaceKey,
    spaceSlug: input.spaceSlug,
    pageSlug: input.pageSlug,
    title: input.title,
    status: input.status,
    parentPageKey: input.parentPageKey,
    updatedAtMs,
    payload: {
      title: input.title,
      bodyMarkdown: input.bodyMarkdown,
      summary: input.summary,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    searchTokens
  })

  const initialRevision = buildRevisionCreateEntity({
    spaceKey: input.spaceKey,
    pageKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    revisionNo: 1,
    editedAtMs: updatedAtMs,
    editor: input.editor,
    payload: {
      title: input.title,
      bodyMarkdown: input.bodyMarkdown,
      editSummary: 'Initial version'
    }
  })

  const createdPage = await client.createEntity(pageCreate)

  const finalRevision = {
    ...initialRevision,
    attributes: initialRevision.attributes.map((attribute) =>
      attribute.key === 'pageKey' ? { ...attribute, value: createdPage.entityKey } : attribute
    )
  }

  const links = await buildLinkCreatesForBody({
    spaceKey: input.spaceKey,
    fromPageKey: createdPage.entityKey,
    fromPageSlug: input.pageSlug,
    bodyMarkdown: input.bodyMarkdown
  })

  const mutate = await client.mutateEntities({
    creates: [finalRevision, ...links]
  })

  return {
    pageKey: createdPage.entityKey,
    txHash: mutate.txHash
  }
}

export type EditPageInput = SavePageInput & {
  pageKey: Hex
  editSummary: string
}

export async function editPage(client: ArkivWriteClient, input: EditPageInput): Promise<{
  pageKey: Hex
  txHash: Hex
  createdRevisions: Hex[]
}> {
  const timestamp = nowIso()
  const updatedAtMs = nowMs()
  const searchTokens = buildSearchTokens(input.title, input.summary, input.bodyMarkdown)

  const revisionCount = (await listRevisionsByPage(input.pageKey)).length
  const nextRevision = revisionCount + 1

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
      bodyMarkdown: input.bodyMarkdown,
      summary: input.summary,
      createdAt: timestamp,
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
      bodyMarkdown: input.bodyMarkdown,
      editSummary: input.editSummary
    }
  })

  const outgoingLinks = await listOutgoingLinks(input.pageKey)
  const newLinkCreates = await buildLinkCreatesForBody({
    spaceKey: input.spaceKey,
    fromPageKey: input.pageKey,
    fromPageSlug: input.pageSlug,
    bodyMarkdown: input.bodyMarkdown
  })

  const mutation = await client.mutateEntities({
    updates: [pageUpdate],
    creates: [revisionCreate, ...newLinkCreates],
    deletes: outgoingLinks.map((link) => ({ entityKey: link.entityKey }))
  })

  return {
    pageKey: input.pageKey,
    txHash: mutation.txHash,
    createdRevisions: mutation.createdEntities
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

export async function transferPageOwnership(
  client: ArkivWriteClient,
  pageKey: Hex,
  newOwner: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  return transferEntityOwnership(client, pageKey, newOwner)
}
