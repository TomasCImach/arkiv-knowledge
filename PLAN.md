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

## Current Verification Snapshot
- Last full pass: `pnpm verify` on 2026-02-25.
- Result: lint/typecheck/unit/integration/e2e/build all pass; live test remains skip-safe when private key is absent.
- Live write proof: `pnpm seed:demo` completed on Kaolin with funded key, creating/reading `arkiv-demo` and demo pages.
- Client tx observability: browser console now logs each wallet prompt under `[arkiv-tx:*]` and presence heartbeat lifecycle under `[presence-heartbeat]`.

## Next Bottlenecks (Optional Improvements)
1. Add a deterministic browser E2E multi-tab realtime test (Playwright) for stronger phase 5 evidence.
2. Add screenshot artifacts to docs for presence expiry and backlinks.
3. Add automated query-latency telemetry for demo diagnostics.
