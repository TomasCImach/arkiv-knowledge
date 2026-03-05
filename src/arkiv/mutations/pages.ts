import type { CreateEntityParameters, MutateEntitiesParameters } from '@arkiv-network/sdk'
import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import {
  buildArchivePageMutateParams,
  buildCreatePageFollowUpMutateParams,
  buildCreatePagePrimaryParams,
  buildDeletePageWithCleanupPlan,
  buildEditPageMutateParams,
  buildTransferOwnershipParams,
  type ArchivePagePlanInput,
  type EditPagePlanInput,
  type SavePagePlanInput
} from '@/arkiv/mutations/plans'
import { listRevisionsByPage } from '@/arkiv/queries/pages'

export type SavePageInput = SavePagePlanInput

type CreatePageRepairResult = {
  hasInitialRevision: boolean
  txHash?: Hex
}

export async function createPage(client: ArkivWriteClient, input: SavePageInput): Promise<{ pageKey: Hex; txHash: Hex }> {
  const primaryPlan = await buildCreatePagePrimaryParams(input)
  const createdPage = await client.createEntity(primaryPlan.params)

  const followUpPlan = await buildCreatePageFollowUpMutateParams({
    spaceKey: input.spaceKey,
    pageKey: createdPage.entityKey,
    pageSlug: input.pageSlug,
    title: input.title,
    summary: input.summary,
    normalizedBodyMarkdown: primaryPlan.normalizedBodyMarkdown,
    editor: input.editor
  })

  try {
    const mutate = await client.mutateEntities(followUpPlan)

    return {
      pageKey: createdPage.entityKey,
      txHash: mutate.txHash
    }
  } catch (error) {
    console.error('create-page follow-up mutation failed; attempting repair', {
      pageKey: createdPage.entityKey,
      error
    })

    let repair: CreatePageRepairResult = {
      hasInitialRevision: false
    }
    try {
      repair = await repairCreatePageFollowUp({
        client,
        pageKey: createdPage.entityKey,
        followUpPlan
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

export type EditPageInput = EditPagePlanInput

export async function editPage(client: ArkivWriteClient, input: EditPageInput): Promise<{
  pageKey: Hex
  txHash: Hex
  createdRevisions: Hex[]
}> {
  const mutation = await client.mutateEntities(await buildEditPageMutateParams(input))

  return {
    pageKey: input.pageKey,
    txHash: mutation.txHash,
    createdRevisions: mutation.createdEntities
  }
}

type RepairCreatePageFollowUpInput = {
  client: ArkivWriteClient
  pageKey: Hex
  followUpPlan: MutateEntitiesParameters
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

  const followUpCreates = input.followUpPlan.creates ?? []
  const revisionCreate = followUpCreates[0]
  const linkCreates = followUpCreates.slice(1)

  if (!hasInitialRevision && revisionCreate) {
    const repairedRevision = await input.client.createEntity(revisionCreate as CreateEntityParameters)
    hasInitialRevision = true
    repairTxHash = repairedRevision.txHash
  }

  if (linkCreates.length > 0) {
    try {
      const repairedLinks = await input.client.mutateEntities({
        creates: linkCreates as CreateEntityParameters[]
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

export async function transferPageOwnership(
  client: ArkivWriteClient,
  pageKey: Hex,
  newOwner: Hex
): Promise<{ entityKey: Hex; txHash: Hex }> {
  const result = await client.changeOwnership(buildTransferOwnershipParams(pageKey, newOwner))

  return {
    entityKey: result.entityKey,
    txHash: result.txHash as Hex
  }
}

export type ArchivePageInput = ArchivePagePlanInput

export async function archivePage(client: ArkivWriteClient, input: ArchivePageInput) {
  const mutation = await client.mutateEntities(await buildArchivePageMutateParams(input))

  return {
    pageKey: input.pageKey,
    txHash: mutation.txHash,
    createdRevisions: mutation.createdEntities
  }
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
  const plan = await buildDeletePageWithCleanupPlan(pageKey)
  const mutation = await client.mutateEntities(plan.params)

  return {
    pageKey,
    txHash: mutation.txHash,
    deletedKeys: plan.deletedKeys,
    deletedCounts: plan.deletedCounts
  }
}
