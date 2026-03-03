import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import { transferEntityOwnership } from '@/arkiv/mutations/ownership'
import { listBacklinks, listOutgoingLinks } from '@/arkiv/queries/links'
import { getPageBySlugInSpace, listRevisionsByPage } from '@/arkiv/queries/pages'
import { listPresenceForPage } from '@/arkiv/queries/presence'
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

type CreatePageRepairResult = {
  hasInitialRevision: boolean
  txHash?: Hex
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

  try {
    const mutate = await client.mutateEntities({
      creates: [finalRevision, ...links]
    })

    return {
      pageKey: createdPage.entityKey,
      txHash: mutate.txHash
    }
  } catch (error) {
    console.error('create-page follow-up mutation failed; attempting repair', {
      pageKey: createdPage.entityKey,
      linkCount: links.length,
      error
    })

    let repair: CreatePageRepairResult = {
      hasInitialRevision: false
    }
    try {
      repair = await repairCreatePageFollowUp({
        client,
        pageKey: createdPage.entityKey,
        revisionCreate: finalRevision,
        linkCreates: links
      })
    } catch (repairError) {
      console.error('create-page repair failed', {
        pageKey: createdPage.entityKey,
        repairError
      })
    }

    if (repair.hasInitialRevision) {
      const recoveredTxHash = repair.txHash ?? createdPage.txHash
      console.warn('create-page recovered via repair path', {
        pageKey: createdPage.entityKey,
        txHash: recoveredTxHash
      })
      return {
        pageKey: createdPage.entityKey,
        txHash: recoveredTxHash
      }
    }

    throw new Error(
      `Page ${createdPage.entityKey} was created but revision/link follow-up failed. Open the page and save again to repair history.`
    )
  }
}

export type EditPageInput = SavePageInput & {
  pageKey: Hex
  editSummary: string
  createdAt?: string
}

export async function editPage(client: ArkivWriteClient, input: EditPageInput): Promise<{
  pageKey: Hex
  txHash: Hex
  createdRevisions: Hex[]
}> {
  const timestamp = nowIso()
  const updatedAtMs = nowMs()
  const searchTokens = buildSearchTokens(input.title, input.summary, input.bodyMarkdown)
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
      bodyMarkdown: input.bodyMarkdown,
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

type RepairCreatePageFollowUpInput = {
  client: ArkivWriteClient
  pageKey: Hex
  revisionCreate: ReturnType<typeof buildRevisionCreateEntity>
  linkCreates: ReturnType<typeof buildLinkCreateEntity>[]
}

async function repairCreatePageFollowUp(input: RepairCreatePageFollowUpInput): Promise<CreatePageRepairResult> {
  let hasInitialRevision = false
  let repairTxHash: Hex | undefined

  try {
    const revisions = await listRevisionsByPage(input.pageKey)
    hasInitialRevision = revisions.some((revision) => revision.revisionNo === 1)
  } catch {
    // Best effort read; create attempt below will repair when possible.
  }

  if (!hasInitialRevision) {
    const repairedRevision = await input.client.createEntity(input.revisionCreate)
    hasInitialRevision = true
    repairTxHash = repairedRevision.txHash
  }

  if (input.linkCreates.length > 0) {
    try {
      const repairedLinks = await input.client.mutateEntities({
        creates: input.linkCreates
      })
      repairTxHash = repairTxHash ?? repairedLinks.txHash
    } catch (error) {
      console.warn('create-page link repair failed; backlinks will recover on next edit', {
        pageKey: input.pageKey,
        error
      })
    }
  }

  return {
    hasInitialRevision,
    txHash: repairTxHash
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

export type ArchivePageInput = {
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

export async function archivePage(client: ArkivWriteClient, input: ArchivePageInput) {
  return editPage(client, {
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

export type DeletePageWithCleanupResult = {
  pageKey: Hex
  txHash: Hex
  deletedKeys: Hex[]
  deletedCounts: {
    revisions: number
    links: number
    presence: number
  }
}

export async function deletePageWithCleanup(
  client: ArkivWriteClient,
  pageKey: Hex
): Promise<DeletePageWithCleanupResult> {
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

  const mutation = await client.mutateEntities({
    deletes: deletedKeys.map((entityKey) => ({ entityKey }))
  })

  return {
    pageKey,
    txHash: mutation.txHash,
    deletedKeys,
    deletedCounts: {
      revisions: revisions.length,
      links: outgoingLinks.length + incomingLinks.length,
      presence: presenceRecords.length
    }
  }
}
