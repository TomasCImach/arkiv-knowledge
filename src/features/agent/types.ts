import type {
  ChangeOwnershipParameters,
  CreateEntityParameters,
  DeleteEntityParameters,
  ExtendEntityParameters,
  MutateEntitiesParameters,
  UpdateEntityParameters
} from '@arkiv-network/sdk'
import type { Hex } from 'viem'
import type { EntityType } from '@/arkiv/types'

export type AgentErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'UPSTREAM_ERROR'

export type AgentApiError = {
  error: {
    code: AgentErrorCode
    message: string
    details?: Record<string, string | number | boolean>
  }
}

export type AgentAttribute = {
  key: string
  value: string | number
}

export type AgentCreateEntityParameters = Omit<CreateEntityParameters, 'payload' | 'attributes'> & {
  payload: number[]
  attributes: AgentAttribute[]
}

export type AgentUpdateEntityParameters = Omit<UpdateEntityParameters, 'payload' | 'attributes'> & {
  payload: number[]
  attributes: AgentAttribute[]
}

export type AgentMutateEntitiesParameters = Omit<MutateEntitiesParameters, 'creates' | 'updates'> & {
  creates?: AgentCreateEntityParameters[]
  updates?: AgentUpdateEntityParameters[]
}

export type AgentSdkCall =
  | {
      method: 'createEntity'
      params: AgentCreateEntityParameters
    }
  | {
      method: 'updateEntity'
      params: AgentUpdateEntityParameters
    }
  | {
      method: 'mutateEntities'
      params: AgentMutateEntitiesParameters
    }
  | {
      method: 'deleteEntity'
      params: DeleteEntityParameters
    }
  | {
      method: 'changeOwnership'
      params: ChangeOwnershipParameters
    }
  | {
      method: 'extendEntity'
      params: ExtendEntityParameters
    }

export type AgentWritePostcondition = {
  readPath: string
  expects: EntityType[]
  note?: string
}

export type AgentWriteIntent = {
  operation: string
  signer: Hex
  sdkCall: AgentSdkCall
  followUpCalls?: AgentSdkCall[]
  postconditions: AgentWritePostcondition[]
}

export type AgentExecuteIntentResult = {
  txHashes: Hex[]
  primaryEntityKey?: Hex
  createdEntityKeys: Hex[]
  updatedEntityKeys: Hex[]
  deletedEntityKeys: Hex[]
  ownershipChangedKeys: Hex[]
  extendedEntityKeys: Hex[]
}

export type AgentReadEnvelope<T> = {
  data: T
}
