import type { Hex } from 'viem'
import type { ArkivWriteClient } from '@/arkiv/clients'
import {
  fromAgentCreateEntityParameters,
  fromAgentMutateEntitiesParameters,
  fromAgentUpdateEntityParameters
} from '@/features/agent/serialization'
import type { AgentExecuteIntentResult, AgentSdkCall, AgentWriteIntent } from '@/features/agent/types'

type TemplateContext = {
  'primary.entityKey'?: string
  'primary.txHash'?: string
}

function dedupeHex(values: Hex[]): Hex[] {
  return Array.from(new Set(values))
}

function replaceTemplate(value: string, context: TemplateContext): string {
  let output = value

  for (const [key, resolved] of Object.entries(context)) {
    if (!resolved) {
      continue
    }

    output = output.replaceAll(`{{${key}}}`, resolved)
  }

  return output
}

function resolveTemplates<T>(value: T, context: TemplateContext): T {
  if (typeof value === 'string') {
    return replaceTemplate(value, context) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplates(item, context)) as T
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
    key,
    resolveTemplates(nested, context)
  ])

  return Object.fromEntries(entries) as T
}

async function executeSdkCall(client: ArkivWriteClient, call: AgentSdkCall): Promise<AgentExecuteIntentResult> {
  if (call.method === 'createEntity') {
    const result = await client.createEntity(fromAgentCreateEntityParameters(call.params))
    return {
      txHashes: [result.txHash as Hex],
      primaryEntityKey: result.entityKey,
      createdEntityKeys: [result.entityKey],
      updatedEntityKeys: [],
      deletedEntityKeys: [],
      ownershipChangedKeys: [],
      extendedEntityKeys: []
    }
  }

  if (call.method === 'updateEntity') {
    const result = await client.updateEntity(fromAgentUpdateEntityParameters(call.params))
    return {
      txHashes: [result.txHash as Hex],
      primaryEntityKey: result.entityKey,
      createdEntityKeys: [],
      updatedEntityKeys: [result.entityKey],
      deletedEntityKeys: [],
      ownershipChangedKeys: [],
      extendedEntityKeys: []
    }
  }

  if (call.method === 'mutateEntities') {
    const result = await client.mutateEntities(fromAgentMutateEntitiesParameters(call.params))
    return {
      txHashes: [result.txHash as Hex],
      createdEntityKeys: result.createdEntities,
      updatedEntityKeys: result.updatedEntities,
      deletedEntityKeys: result.deletedEntities,
      ownershipChangedKeys: result.ownershipChanges,
      extendedEntityKeys: result.extendedEntities,
      primaryEntityKey:
        result.updatedEntities[0] ??
        result.createdEntities[0] ??
        result.deletedEntities[0] ??
        result.ownershipChanges[0] ??
        result.extendedEntities[0]
    }
  }

  if (call.method === 'deleteEntity') {
    const result = await client.deleteEntity(call.params)
    return {
      txHashes: [result.txHash as Hex],
      primaryEntityKey: result.entityKey,
      createdEntityKeys: [],
      updatedEntityKeys: [],
      deletedEntityKeys: [result.entityKey],
      ownershipChangedKeys: [],
      extendedEntityKeys: []
    }
  }

  if (call.method === 'changeOwnership') {
    const result = await client.changeOwnership(call.params)
    return {
      txHashes: [result.txHash as Hex],
      primaryEntityKey: result.entityKey,
      createdEntityKeys: [],
      updatedEntityKeys: [],
      deletedEntityKeys: [],
      ownershipChangedKeys: [result.entityKey],
      extendedEntityKeys: []
    }
  }

  const result = await client.extendEntity(call.params)
  return {
    txHashes: [result.txHash as Hex],
    primaryEntityKey: result.entityKey,
    createdEntityKeys: [],
    updatedEntityKeys: [],
    deletedEntityKeys: [],
    ownershipChangedKeys: [],
    extendedEntityKeys: [result.entityKey]
  }
}

function mergeResults(left: AgentExecuteIntentResult, right: AgentExecuteIntentResult): AgentExecuteIntentResult {
  return {
    txHashes: dedupeHex([...left.txHashes, ...right.txHashes]),
    primaryEntityKey: left.primaryEntityKey ?? right.primaryEntityKey,
    createdEntityKeys: dedupeHex([...left.createdEntityKeys, ...right.createdEntityKeys]),
    updatedEntityKeys: dedupeHex([...left.updatedEntityKeys, ...right.updatedEntityKeys]),
    deletedEntityKeys: dedupeHex([...left.deletedEntityKeys, ...right.deletedEntityKeys]),
    ownershipChangedKeys: dedupeHex([...left.ownershipChangedKeys, ...right.ownershipChangedKeys]),
    extendedEntityKeys: dedupeHex([...left.extendedEntityKeys, ...right.extendedEntityKeys])
  }
}

export async function executeAgentIntent(client: ArkivWriteClient, intent: AgentWriteIntent): Promise<AgentExecuteIntentResult> {
  const initial = await executeSdkCall(client, intent.sdkCall)

  const context: TemplateContext = {
    'primary.entityKey': initial.primaryEntityKey,
    'primary.txHash': initial.txHashes[0]
  }

  let aggregate = initial

  for (const followUpCall of intent.followUpCalls ?? []) {
    const resolvedCall = resolveTemplates(followUpCall, context)
    const result = await executeSdkCall(client, resolvedCall)
    aggregate = mergeResults(aggregate, result)
  }

  return aggregate
}
