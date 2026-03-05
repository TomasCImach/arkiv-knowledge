import type {
  ChangeOwnershipParameters,
  CreateEntityParameters,
  DeleteEntityParameters,
  ExtendEntityParameters,
  MutateEntitiesParameters,
  UpdateEntityParameters
} from '@arkiv-network/sdk'
import type { AgentAttribute, AgentCreateEntityParameters, AgentMutateEntitiesParameters, AgentUpdateEntityParameters } from '@/features/agent/types'

function toAgentAttributes(attributes: CreateEntityParameters['attributes']): AgentAttribute[] {
  return attributes.map((attribute) => ({
    key: attribute.key,
    value: attribute.value
  }))
}

function fromAgentAttributes(attributes: AgentAttribute[]): CreateEntityParameters['attributes'] {
  return attributes.map((attribute) => ({
    key: attribute.key,
    value: attribute.value
  }))
}

export function toAgentCreateEntityParameters(input: CreateEntityParameters): AgentCreateEntityParameters {
  return {
    payload: Array.from(input.payload),
    contentType: input.contentType,
    expiresIn: input.expiresIn,
    attributes: toAgentAttributes(input.attributes)
  }
}

export function fromAgentCreateEntityParameters(input: AgentCreateEntityParameters): CreateEntityParameters {
  return {
    payload: new Uint8Array(input.payload),
    contentType: input.contentType,
    expiresIn: input.expiresIn,
    attributes: fromAgentAttributes(input.attributes)
  }
}

export function toAgentUpdateEntityParameters(input: UpdateEntityParameters): AgentUpdateEntityParameters {
  return {
    entityKey: input.entityKey,
    payload: Array.from(input.payload),
    contentType: input.contentType,
    expiresIn: input.expiresIn,
    attributes: toAgentAttributes(input.attributes)
  }
}

export function fromAgentUpdateEntityParameters(input: AgentUpdateEntityParameters): UpdateEntityParameters {
  return {
    entityKey: input.entityKey,
    payload: new Uint8Array(input.payload),
    contentType: input.contentType,
    expiresIn: input.expiresIn,
    attributes: fromAgentAttributes(input.attributes)
  }
}

export function toAgentMutateEntitiesParameters(input: MutateEntitiesParameters): AgentMutateEntitiesParameters {
  return {
    creates: input.creates?.map(toAgentCreateEntityParameters),
    updates: input.updates?.map(toAgentUpdateEntityParameters),
    deletes: input.deletes,
    extensions: input.extensions,
    ownershipChanges: input.ownershipChanges
  }
}

export function fromAgentMutateEntitiesParameters(input: AgentMutateEntitiesParameters): MutateEntitiesParameters {
  return {
    creates: input.creates?.map(fromAgentCreateEntityParameters),
    updates: input.updates?.map(fromAgentUpdateEntityParameters),
    deletes: input.deletes,
    extensions: input.extensions,
    ownershipChanges: input.ownershipChanges
  }
}

export function toAgentDeleteEntityParameters(input: DeleteEntityParameters): DeleteEntityParameters {
  return input
}

export function toAgentChangeOwnershipParameters(input: ChangeOwnershipParameters): ChangeOwnershipParameters {
  return input
}

export function toAgentExtendEntityParameters(input: ExtendEntityParameters): ExtendEntityParameters {
  return input
}
