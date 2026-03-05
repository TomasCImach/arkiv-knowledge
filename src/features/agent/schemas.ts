import { isAddress, isHex } from 'viem'
import { z } from 'zod'

function isEntityKey(value: string): boolean {
  return isHex(value, { strict: true }) && value.length === 66
}

export const hexEntityKeySchema = z.string().refine((value) => isEntityKey(value), {
  message: 'Expected a 32-byte entity key.'
})

export const walletAddressSchema = z.string().refine((value) => isAddress(value), {
  message: 'Expected a valid wallet address.'
})

const statusSchema = z.enum(['draft', 'published', 'archived'])
const visibilitySchema = z.enum(['public', 'unlisted', 'private'])
const spaceStatusSchema = z.enum(['active', 'archived'])

export const createSpaceIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000),
  visibility: visibilitySchema,
  status: spaceStatusSchema.optional()
})

export const updateSpaceIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000),
  visibility: visibilitySchema,
  status: spaceStatusSchema.optional()
})

export const transferSpaceIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  newOwner: walletAddressSchema
})

export const createPageIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  pageSlug: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(240),
  summary: z.string().trim().max(2000),
  bodyMarkdown: z.string().max(1_000_000),
  status: statusSchema,
  parentPageKey: hexEntityKeySchema.optional()
})

export const updatePageIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  pageSlug: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(240),
  summary: z.string().trim().max(2000),
  bodyMarkdown: z.string().max(1_000_000),
  status: statusSchema,
  editSummary: z.string().trim().min(1).max(280),
  parentPageKey: hexEntityKeySchema.optional()
})

export const archivePageIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  pageSlug: z.string().trim().min(1).max(160),
  editSummary: z.string().trim().min(1).max(280).optional()
})

export const deletePageIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  pageSlug: z.string().trim().min(1).max(160)
})

export const transferPageIntentSchema = z.object({
  spaceSlug: z.string().trim().min(1).max(120),
  pageSlug: z.string().trim().min(1).max(160),
  newOwner: walletAddressSchema
})

export const extendEntityIntentSchema = z.object({
  entityKey: hexEntityKeySchema,
  kind: z.enum(['space', 'page', 'revision'])
})

export const presenceJoinSchema = z.object({
  spaceKey: hexEntityKeySchema,
  pageKey: hexEntityKeySchema,
  viewer: walletAddressSchema,
  sessionId: z.string().trim().min(1).max(160),
  displayName: z.string().trim().min(1).max(120)
})

export const presenceEntitySchema = z.object({
  entityKey: hexEntityKeySchema
})
