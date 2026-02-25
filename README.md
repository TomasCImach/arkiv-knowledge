# Arkiv-First Knowledge Base

Arkiv-first documentation app built for the Arkiv Builders Challenge.

## Why This App Scores Well
- Core domain data is stored in Arkiv entities (`kb.space`, `kb.page`, `kb.revision`, `kb.link`, `kb.presence`).
- Canonical page updates use `updateEntity` semantics through `mutateEntities`, while revisions remain append-only.
- Relationships are persisted as first-class link entities (`kb.link`) and rendered via query results.
- Expiration is intentional per entity type, with owner extension controls and short-lived presence entities.
- Browsing is public (no wallet). Wallet connection is required only for writes.

## Stack
- Next.js 15 App Router, TypeScript, Node runtime
- Arkiv SDK `@arkiv-network/sdk@0.6.x`
- wagmi + RainbowKit wallet UX
- Vitest unit/integration/e2e tests
- Vercel-ready deployment

## Quick Start
```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables
```bash
NEXT_PUBLIC_ARKIV_CHAIN=kaolin
NEXT_PUBLIC_ARKIV_RPC_URL=https://kaolin.hoodi.arkiv.network/rpc
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<walletconnect-project-id>

# Optional live write tests / seed scripts
ARKIV_LIVE_TEST_PRIVATE_KEY=<0x...>
ARKIV_DEMO_PRIVATE_KEY=<0x...>
ARKIV_CHAIN=kaolin
ARKIV_RPC_URL=https://kaolin.hoodi.arkiv.network/rpc
```

## Entity Schema
| Type | Required attributes | Payload | Default expiration |
|---|---|---|---|
| `kb.space` | `type`, `schemaVersion`, `spaceSlug`, `visibility`, `status`, `updatedAtMs` | `{ name, description, createdAt, updatedAt }` | 365d |
| `kb.page` | `type`, `schemaVersion`, `spaceKey`, `spaceSlug`, `pageSlug`, `title`, `status`, `updatedAtMs`, `parentPageKey?`, `token_0..token_19` | `{ title, bodyMarkdown, summary, createdAt, updatedAt }` | published 365d, draft 30d |
| `kb.revision` | `type`, `schemaVersion`, `spaceKey`, `pageKey`, `revisionNo`, `editedAtMs`, `editor` | `{ title, bodyMarkdown, editSummary }` | 180d |
| `kb.link` | `type`, `schemaVersion`, `spaceKey`, `fromPageKey`, `toPageKey`, `updatedAtMs` | `{ sourceSlug, targetSlug }` | 30d |
| `kb.presence` | `type`, `schemaVersion`, `spaceKey`, `pageKey`, `viewer`, `sessionId` | `{ displayName, joinedAt }` | 90s |

## Query Paths (Arkiv-first)
- Public space list: `type=kb.space && schemaVersion=1`
- Space pages: `type=kb.page && schemaVersion=1 && spaceSlug=<slug>`
- Page revisions: `type=kb.revision && schemaVersion=1 && pageKey=<pageKey>`
- Backlinks: `type=kb.link && schemaVersion=1 && toPageKey=<pageKey>`
- Presence: `type=kb.presence && schemaVersion=1 && pageKey=<pageKey>`
- Search (query-first): `type=kb.page && schemaVersion=1 && spaceSlug=<slug> && status? && (token_0=<t> OR ... OR token_19=<t>)`

## Example Query Builder Usage
```ts
const spaces = await publicClient
  .buildQuery()
  .where(and([eq('type', 'kb.space'), eq('schemaVersion', '1')]))
  .withAttributes(true)
  .withPayload(true)
  .fetch()
```

```ts
const backlinks = await publicClient
  .buildQuery()
  .where(and([eq('type', 'kb.link'), eq('schemaVersion', '1'), eq('toPageKey', pageKey)]))
  .withAttributes(true)
  .withPayload(true)
  .fetch()
```

```ts
const mutation = await walletClient.mutateEntities({
  updates: [pageUpdate],
  creates: [revisionCreate, ...linkCreates],
  deletes: oldLinkEdges.map((edge) => ({ entityKey: edge.entityKey }))
})
```

## Ownership and Read/Write Boundary
- Read routes (`/`, `/spaces/[spaceSlug]`, `/spaces/[spaceSlug]/[pageSlug]`) are public.
- Write routes and buttons (`/new/space`, create/edit page, presence join, extend TTL) require wallet connection.
- Extension controls are owner-checked in UI and only enabled for near-expiry entities.

## Lifecycle / Expiration Policy
- Long-lived: spaces and published pages (365d)
- Medium: revisions (180d)
- Regenerated medium: links (30d)
- Ephemeral: presence (90s) with heartbeat extension

## Scripts
```bash
pnpm verify                # lint + typecheck + tests + build + live smoke (skip-safe)
pnpm seed:demo             # idempotent demo data seed (requires key)
pnpm restore:demo          # re-run seed script for fallback dataset
pnpm verify:phase all      # file-level phase verification
```

## Testing
- Unit: schema contracts, parser behavior, expiration policy, link extraction
- Integration: query predicate generation, canonical update + revision + link rewrite mutation path
- E2E (component-level): no-wallet read / wallet-gated write boundary
- Live smoke (optional): create + read-back against Arkiv network

## Demo Flow (3–5 min)
1. Browse spaces publicly from `/` without wallet.
2. Connect wallet and create a space (`/new/space`).
3. Create a page (`/spaces/<slug>/new`), then edit it.
4. Show canonical page key stability + growing revision list.
5. Add wiki links and show backlinks sourced from `kb.link` queries.
6. Join presence and show short-lived active viewers.
7. Show realtime refresh with two sessions.
