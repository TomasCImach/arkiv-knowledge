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

### Phase 9 — True Page Hierarchy (Iteration 16)
- [x] Parent selector + `parentPageKey` wiring in create/edit forms.
- [x] Nested page hierarchy rendering in space/page sidebars with deterministic ordering.
- [x] Parent-aware query filters (`all`, `root`, `child`) in space search UI and predicates.

**Exit criteria status:** met.
- Hierarchy authoring (set/reparent) is exposed in wallet write flows.
- Sidebar navigation reflects page tree depth and active context.
- Breadcrumbs include ancestor chain on page detail routes.
- Unit/integration/e2e coverage added for tree behavior and parent guardrails.

### Phase 10 — Ownership Transfer Depth (Iteration 17)
- [x] Added transfer mutation wrappers (`changeOwnership`) for canonical entities.
- [x] Added owner-only transfer UI actions for `kb.space` and canonical `kb.page`.
- [x] Added owner-aware create/edit page guardrails with explicit non-owner/disconnected messages.
- [x] Added “Owned by me / Any owner” filter chips over Arkiv `ownedBy(...)` query paths.

**Exit criteria status:** met.
- Ownership transfer is directly demoable on settings and page detail routes.
- Owner handoff behavior is covered by integration/component tests.
- Authoring controls enforce owner boundaries without breaking no-wallet browse reads.

### Phase 11 — Query + Discovery Depth (Iteration 18)
- [x] Sort-aware page search model (`updated desc`, `updated asc`, `title asc`) in Arkiv query paths.
- [x] Owner filter wiring in both space-scoped and global page search routes.
- [x] Cross-space search route at `/search/pages` using Arkiv query predicates only.
- [x] Dev-only query debug panel exposing normalized predicate behavior in UI.

**Exit criteria status:** met.
- Judges can demonstrate filter+sort behavior without relying on client-only post-processing.
- Cross-space page discovery is available from global navigation and remains read-path public.
- Query predicates are test-covered for local and global search builders.

### Phase 12 — Judge Evidence Pack (Iteration 19)
- [x] Added deterministic Playwright evidence capture script for key routes (`home`, `space`, `page`, `settings`, `hierarchy`, `ownership-transfer`, `global-search`).
- [x] Added optional two-tab realtime proof capture path with explicit skip reporting when no funded demo key is available.
- [x] Added submission mapping doc (`SUBMISSION_EVIDENCE.md`) linking rubric -> code -> tests -> demo proof.
- [x] Added fail-soft CI evidence capture + artifact upload and integrated evidence-doc verification into `pnpm verify`.

**Exit criteria status:** met.
- Evidence artifacts are generated at `output/playwright/evidence-pack/`.
- CI uploads evidence artifacts when present without failing the main verify gate.
- Submission traceability is explicit and maintained with project docs.

### Phase 13 — Canonical Identity + Slug Integrity (Iteration 20)
- [x] Added deterministic canonical selectors for slug collisions in space/page reads.
- [x] Re-anchored space/page browse queries on canonical `spaceKey` after slug resolution.
- [x] Added create-time collision guards for duplicate `spaceSlug` and duplicate `(spaceKey,pageSlug)`.
- [x] Added integration coverage for canonical selection and conflict guard behavior.

**Exit criteria status:** met.
- Canonical route reads are deterministic when duplicate slugs exist.
- Space/page listing and lookup paths now prefer `spaceKey` anchoring over slug-only scope.
- Duplicate create attempts fail early with explicit operator-facing messages.

## Current Verification Snapshot
- Last full pass: `pnpm verify` on 2026-03-01 (post iteration 20 canonical-integrity rollout).
- Result: lint/typecheck/unit/integration/e2e/build all pass; live test remains skip-safe when private key is absent.
- Added passing integrity coverage for canonical selection + duplicate guards (`tests/integration/canonical-resolution.test.ts`, `tests/integration/create-conflict-guards.test.ts`).
- Live write proof: `pnpm seed:demo` completed on Kaolin with funded key, creating/reading `arkiv-demo` and demo pages.
- Client tx observability: browser console now logs each wallet prompt under `[arkiv-tx:*]` and presence heartbeat lifecycle under `[presence-heartbeat]`.
- Evidence capture proof: `pnpm evidence:capture` generated deterministic screenshots and status report (`ARTIFACT_INDEX.md` + `report.json`).

## Next Bottlenecks (Optional Improvements)
1. Add wallet-extension-backed CI fixture to convert realtime proof from skip-soft to always-on.
2. Add auto-generated short video clips in evidence capture (`mp4`) for judge walkthrough packaging.
3. Add signed artifact manifest (hash list) for reproducibility claims.

## Plan V1 (2026-02-25)
- See [planV1.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV1.md) for the next rubric-weighted iteration sequence.
- Priority order executed: space settings -> true page hierarchy -> query/discovery depth -> ownership transfer depth -> judge evidence pack (complete).

## Plan V2 (2026-03-01)
- See [planV2.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV2.md) for the next score-lift sequence focused on data integrity, lifecycle correctness, and submission hardening.
