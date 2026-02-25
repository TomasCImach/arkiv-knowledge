# PLAN.md

## Goal
Ship a high-scoring Arkiv-first Knowledge Base submission with clear evidence across all rubric categories, prioritizing Arkiv integration depth.

## Rubric-Weighted Execution Strategy
- **40% Arkiv Integration**: schema quality, query usage, ownership model, relationships, expiration strategy, advanced features.
- **30% Functionality**: spaces/pages CRUD, revisioning, search/filtering, reliable browse/edit flows.
- **20% UX**: no-wallet browse, clear IA, understandable ownership/expiry states.
- **10% Code Quality/Docs**: readable modules, tests, setup docs, demo script.

## Phase Plan (Status)

### Phase 0 — Bootstrap + Arkiv Connectivity
- [x] Next.js 15 app shell + Arkiv client split (public read / wallet write).
- [x] Smoke read/write scripts (`test:live`, `seed:demo`).
- [x] CI and verify pipeline (`pnpm verify`).

**Exit criteria status:** met.
- Public browse route loads without wallet.
- Write-path script can create and read back when key/env is provided.

### Phase 1 — Core Domain Model
- [x] Entity builders implemented for `kb.space`, `kb.page`, `kb.revision`, `kb.link`, `kb.presence`.
- [x] Schema validation/parsing + deterministic unit tests.
- [x] Expiration matrix and near-expiry policy constants.

**Exit criteria status:** met.
- Deterministic schema contracts and passing tests.

### Phase 2 — Spaces + Pages MVP
- [x] Public space listing and space landing route.
- [x] Page create/read/edit routes.
- [x] Edit flow uses `mutateEntities` update + revision create.

**Exit criteria status:** met.
- Canonical page key remains stable while revisions append.

### Phase 3 — Relationships + Query-First Navigation
- [x] Wiki-link extraction and `kb.link` edge writes.
- [x] Backlinks UI driven from Arkiv link queries.
- [x] Search/filter uses query predicates, not client-only filtering.

**Exit criteria status:** met.
- Relationship-derived UI present and query-backed.

### Phase 4 — Expiration + Presence
- [x] Presence entities with short TTL and heartbeat extension.
- [x] Near-expiry owner extension actions for space/page/revision.
- [x] Expiration state surfaced in UI.

**Exit criteria status:** met.
- Demonstrable lifecycle: create -> extend -> expire.

### Phase 5 — Real-Time + Resilience
- [x] `subscribeEntityEvents` wiring with relevance checks.
- [x] Polling fallback when event subscription degrades.
- [x] Refresh behavior supports two-session demo.

**Exit criteria status:** met.
- Realtime + fallback behavior implemented and testable.

### Phase 6 — Submission Hardening
- [x] README with architecture, schema table, and query examples.
- [x] Deterministic seed/restore scripts and verify-phase script.
- [x] Demo script updated for judge-oriented 3–5 minute walkthrough.

**Exit criteria status:** met.
- Full verification loop passes (`pnpm verify`).
- Live smoke suite is skip-safe without key and actionable with key.

### Phase 7 — UX Benchmark Alignment (BookStack-Inspired)
- [x] Persistent left navigation with space hierarchy in global shell.
- [x] Breadcrumb-first information scent across home/space/page/edit/create routes.
- [x] Dense page/space list presentation and content-first reading pane styling.

**Exit criteria status:** met.
- Judge can browse hierarchy quickly in 3–5 minute demo.
- UX remains no-wallet browse / wallet-only writes.

### Phase 8 — Space Settings Ownership (Iteration 15)
- [x] Owner-managed settings route at `/spaces/[spaceSlug]/settings`.
- [x] `updateSpace` contract preserves `createdAt` while refreshing `updatedAt`.
- [x] Non-owner and disconnected wallets are blocked with explicit read-only messaging.

**Exit criteria status:** met.
- Space settings are publicly readable and owner-writable.
- Space detail now links to settings with explicit ownership semantics.
- Integration/e2e coverage added for update path and owner gating.

## Current Verification Snapshot
- Last full pass: `pnpm verify` on 2026-02-25 (post iteration 15 space-settings rollout).
- Result: lint/typecheck/unit/integration/e2e/build all pass; live test remains skip-safe when private key is absent.
- Live write proof: `pnpm seed:demo` completed on Kaolin with funded key, creating/reading `arkiv-demo` and demo pages.
- Client tx observability: browser console now logs each wallet prompt under `[arkiv-tx:*]` and presence heartbeat lifecycle under `[presence-heartbeat]`.

## Next Bottlenecks (Optional Improvements)
1. Implement true page hierarchy UX (parent selector + nested tree rendering) from `parentPageKey`.
2. Implement ownership transfer depth for `kb.space` and canonical `kb.page`.
3. Add deterministic browser E2E multi-tab realtime artifact for stronger phase 5 evidence.

## Plan V1 (2026-02-25)
- See [planV1.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV1.md) for the next rubric-weighted iteration sequence.
- Priority order: space settings -> true page hierarchy -> ownership transfer depth -> query/discovery depth -> judge evidence pack.
