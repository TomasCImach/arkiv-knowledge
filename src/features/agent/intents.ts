import type { Hex } from 'viem'
import {
  buildArchivePageMutateParams,
  buildCreatePageFollowUpMutateParams,
  buildCreatePagePrimaryParams,
  buildCreateSpaceParams,
  buildDeletePageWithCleanupPlan,
  buildEditPageMutateParams,
  buildExtendEntityParams,
  buildTransferOwnershipParams,
  buildUpdateSpaceParams
} from '@/arkiv/mutations/plans'
import { queryByEntityKey } from '@/arkiv/queries/base'
import { getPageBySlugInSpace } from '@/arkiv/queries/pages'
import { getSpaceBySlug } from '@/arkiv/queries/spaces'
import type { EntityType } from '@/arkiv/types'
import { canManageOwnedEntity } from '@/features/ownership/permissions'
import { AgentApiRequestError } from '@/features/agent/errors'
import {
  toAgentChangeOwnershipParameters,
  toAgentCreateEntityParameters,
  toAgentExtendEntityParameters,
  toAgentMutateEntitiesParameters,
  toAgentUpdateEntityParameters
} from '@/features/agent/serialization'
import type { AgentWriteIntent } from '@/features/agent/types'

function postcondition(readPath: string, expects: EntityType[], note?: string) {
  return {
    readPath,
    expects,
    note
  }
}

function mapConflictError(error: unknown): never {
  if (error instanceof Error && /already exists/i.test(error.message)) {
    throw new AgentApiRequestError('CONFLICT', error.message, 409)
  }

  throw error
}

function assertOwner(owner: string | undefined, signer: Hex, resource: string): void {
  if (!canManageOwnedEntity(owner, signer)) {
    throw new AgentApiRequestError('FORBIDDEN', `Only the owner can mutate this ${resource}.`, 403)
  }
}

async function requireSpaceBySlug(spaceSlug: string) {
  const space = await getSpaceBySlug(spaceSlug)
  if (!space) {
    throw new AgentApiRequestError('NOT_FOUND', `Space "${spaceSlug}" not found.`, 404)
  }

  return space
}

async function requirePageBySlug(spaceSlug: string, pageSlug: string) {
  const space = await requireSpaceBySlug(spaceSlug)
  const page = await getPageBySlugInSpace(space.entityKey, pageSlug)

  if (!page) {
    throw new AgentApiRequestError('NOT_FOUND', `Page "${pageSlug}" not found in space "${spaceSlug}".`, 404)
  }

  return {
    space,
    page
  }
}

export async function buildCreateSpaceIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    name: string
    description: string
    visibility: 'public' | 'unlisted' | 'private'
    status?: 'active' | 'archived'
  }
): Promise<AgentWriteIntent> {
  try {
    const params = await buildCreateSpaceParams(input)
    return {
      operation: 'spaces.create',
      signer,
      sdkCall: {
        method: 'createEntity',
        params: toAgentCreateEntityParameters(params)
      },
      postconditions: [postcondition(`/api/agent/v1/spaces/${input.spaceSlug}`, ['kb.space'])]
    }
  } catch (error) {
    mapConflictError(error)
  }
}

export async function buildUpdateSpaceIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    name: string
    description: string
    visibility: 'public' | 'unlisted' | 'private'
    status?: 'active' | 'archived'
  }
): Promise<AgentWriteIntent> {
  const space = await requireSpaceBySlug(input.spaceSlug)
  assertOwner(space.owner, signer, 'space')

  const params = buildUpdateSpaceParams(space.entityKey, {
    ...input,
    createdAt: space.payload.createdAt
  })

  return {
    operation: 'spaces.update',
    signer,
    sdkCall: {
      method: 'updateEntity',
      params: toAgentUpdateEntityParameters(params)
    },
    postconditions: [postcondition(`/api/agent/v1/spaces/${input.spaceSlug}`, ['kb.space'])]
  }
}

export async function buildTransferSpaceIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    newOwner: string
  }
): Promise<AgentWriteIntent> {
  const space = await requireSpaceBySlug(input.spaceSlug)
  assertOwner(space.owner, signer, 'space')

  return {
    operation: 'spaces.transfer',
    signer,
    sdkCall: {
      method: 'changeOwnership',
      params: toAgentChangeOwnershipParameters(buildTransferOwnershipParams(space.entityKey, input.newOwner as Hex))
    },
    postconditions: [postcondition(`/api/agent/v1/spaces/${input.spaceSlug}`, ['kb.space'])]
  }
}

export async function buildCreatePageIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    pageSlug: string
    title: string
    summary: string
    bodyMarkdown: string
    status: 'draft' | 'published' | 'archived'
    parentPageKey?: string
  }
): Promise<AgentWriteIntent> {
  const space = await requireSpaceBySlug(input.spaceSlug)
  assertOwner(space.owner, signer, 'space')

  try {
    const primaryPlan = await buildCreatePagePrimaryParams({
      spaceKey: space.entityKey,
      spaceSlug: input.spaceSlug,
      pageSlug: input.pageSlug,
      title: input.title,
      summary: input.summary,
      bodyMarkdown: input.bodyMarkdown,
      status: input.status,
      editor: signer,
      parentPageKey: input.parentPageKey as Hex | undefined
    })

    const followUp = await buildCreatePageFollowUpMutateParams({
      spaceKey: space.entityKey,
      pageKey: '{{primary.entityKey}}' as Hex,
      pageSlug: input.pageSlug,
      title: input.title,
      summary: input.summary,
      normalizedBodyMarkdown: primaryPlan.normalizedBodyMarkdown,
      editor: signer
    })

    return {
      operation: 'pages.create',
      signer,
      sdkCall: {
        method: 'createEntity',
        params: toAgentCreateEntityParameters(primaryPlan.params)
      },
      followUpCalls: [
        {
          method: 'mutateEntities',
          params: toAgentMutateEntitiesParameters(followUp)
        }
      ],
      postconditions: [
        postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}`, ['kb.page']),
        postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}/revisions`, ['kb.revision'])
      ]
    }
  } catch (error) {
    mapConflictError(error)
  }
}

export async function buildUpdatePageIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    pageSlug: string
    title: string
    summary: string
    bodyMarkdown: string
    status: 'draft' | 'published' | 'archived'
    editSummary: string
    parentPageKey?: string
  }
): Promise<AgentWriteIntent> {
  const { space, page } = await requirePageBySlug(input.spaceSlug, input.pageSlug)
  assertOwner(page.owner, signer, 'page')

  const params = await buildEditPageMutateParams({
    spaceKey: space.entityKey,
    spaceSlug: input.spaceSlug,
    pageKey: page.entityKey,
    pageSlug: input.pageSlug,
    title: input.title,
    summary: input.summary,
    bodyMarkdown: input.bodyMarkdown,
    status: input.status,
    editor: signer,
    editSummary: input.editSummary,
    parentPageKey: input.parentPageKey as Hex | undefined,
    createdAt: page.payload.createdAt
  })

  return {
    operation: 'pages.update',
    signer,
    sdkCall: {
      method: 'mutateEntities',
      params: toAgentMutateEntitiesParameters(params)
    },
    postconditions: [
      postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}`, ['kb.page']),
      postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}/revisions`, ['kb.revision'])
    ]
  }
}

export async function buildArchivePageIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    pageSlug: string
    editSummary?: string
  }
): Promise<AgentWriteIntent> {
  const { space, page } = await requirePageBySlug(input.spaceSlug, input.pageSlug)
  assertOwner(page.owner, signer, 'page')

  const params = await buildArchivePageMutateParams({
    spaceKey: space.entityKey,
    spaceSlug: input.spaceSlug,
    pageKey: page.entityKey,
    pageSlug: input.pageSlug,
    title: page.payload.title,
    summary: page.payload.summary,
    bodyMarkdown: page.payload.bodyMarkdown,
    editor: signer,
    parentPageKey: page.parentPageKey,
    createdAt: page.payload.createdAt,
    editSummary: input.editSummary
  })

  return {
    operation: 'pages.archive',
    signer,
    sdkCall: {
      method: 'mutateEntities',
      params: toAgentMutateEntitiesParameters(params)
    },
    postconditions: [postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}`, ['kb.page'])]
  }
}

export async function buildDeletePageIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    pageSlug: string
  }
): Promise<AgentWriteIntent> {
  const { page } = await requirePageBySlug(input.spaceSlug, input.pageSlug)
  assertOwner(page.owner, signer, 'page')

  const plan = await buildDeletePageWithCleanupPlan(page.entityKey)

  return {
    operation: 'pages.delete',
    signer,
    sdkCall: {
      method: 'mutateEntities',
      params: toAgentMutateEntitiesParameters(plan.params)
    },
    postconditions: [
      postcondition(
        `/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}`,
        ['kb.page', 'kb.revision', 'kb.link', 'kb.presence'],
        'Read should return NOT_FOUND after delete.'
      )
    ]
  }
}

export async function buildTransferPageIntent(
  signer: Hex,
  input: {
    spaceSlug: string
    pageSlug: string
    newOwner: string
  }
): Promise<AgentWriteIntent> {
  const { page } = await requirePageBySlug(input.spaceSlug, input.pageSlug)
  assertOwner(page.owner, signer, 'page')

  return {
    operation: 'pages.transfer',
    signer,
    sdkCall: {
      method: 'changeOwnership',
      params: toAgentChangeOwnershipParameters(buildTransferOwnershipParams(page.entityKey, input.newOwner as Hex))
    },
    postconditions: [postcondition(`/api/agent/v1/spaces/${input.spaceSlug}/pages/${input.pageSlug}`, ['kb.page'])]
  }
}

export async function buildExtendEntityIntent(
  signer: Hex,
  input: {
    entityKey: string
    kind: 'space' | 'page' | 'revision'
  }
): Promise<AgentWriteIntent> {
  let entity

  try {
    entity = await queryByEntityKey(input.entityKey as Hex)
  } catch {
    throw new AgentApiRequestError('NOT_FOUND', `Entity "${input.entityKey}" not found.`, 404)
  }

  assertOwner(entity.owner, signer, 'entity')

  return {
    operation: 'entities.extend',
    signer,
    sdkCall: {
      method: 'extendEntity',
      params: toAgentExtendEntityParameters(buildExtendEntityParams(input.entityKey as Hex, input.kind))
    },
    postconditions: [postcondition(`/api/agent/v1/meta`, ['kb.space', 'kb.page', 'kb.revision'])]
  }
}
