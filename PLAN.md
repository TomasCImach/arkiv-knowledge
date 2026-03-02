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

### Phase 14 — Lifecycle Correctness Hardening (Iteration 21)
- [x] Page edits now preserve canonical `payload.createdAt` instead of resetting it.
- [x] Revision sequencing now uses `max(revisionNo)+1` instead of list length.
- [x] Added compensation path for create-page follow-up mutation failures (log + repair attempt).
- [x] Added integration coverage for createdAt stability, revision sequencing, and repair behavior.

**Exit criteria status:** met.
- Canonical page lifecycle metadata remains stable across edits.
- Revision numbering remains monotonic even with sparse/out-of-order history.
- Two-step create flow now has explicit recovery behavior when revision/link follow-up fails.

### Phase 15 — Visibility Enforcement + Strict Evidence Reliability (Iteration 22)
- [x] Enforced private-space route reads with owner-context checks across space/page/new/edit/settings routes.
- [x] Filtered public browse surfaces to list only public spaces while keeping unlisted direct-link readable.
- [x] Filtered global page search results against visible spaces (private excluded for non-owner viewers).
- [x] Added deterministic visibility/realtime regression coverage and strict evidence CI workflow.

**Exit criteria status:** met.
- Anonymous/disconnected viewer is blocked from private routes.
- Owner context can read/manage private spaces when authenticated.
- Global search excludes private pages without owner context.
- Strict evidence run now passes with fail-hard mode and captured artifact report.

### Phase 16 — Archive/Delete Lifecycle Completeness (Iteration 23)
- [x] Added owner-only page lifecycle actions (archive + delete) on page detail route.
- [x] Added delete cleanup mutation removing canonical page + related `kb.link`, `kb.presence`, and `kb.revision` entities.
- [x] Defined and surfaced revision retention policy (archive keeps history; delete purges revisions).
- [x] Added integration/e2e coverage for cleanup and owner lifecycle controls.

**Exit criteria status:** met.
- Owner can archive canonical page from detail route without leaving browse context.
- Owner can hard-delete page with explicit slug confirmation and deterministic cleanup.
- Post-delete navigation returns to canonical space route without stale page references.

### Phase 17 — Judge-Optimized Submission Assets (Iteration 24)
- [x] Upgraded README with submission sections (team, demo URL, architecture diagram, judge screenshots).
- [x] Added committed screenshot assets under `public/submission/`.
- [x] Added `pnpm verify:submission` gate and wired it into `pnpm verify` + CI.
- [x] Extended evidence capture output with walkthrough-clip artifact (video when available, trace fallback) and hash manifest.

**Exit criteria status:** met.
- Submission docs/asset presence is now automatically validated.
- Evidence bundle includes reproducibility hash manifest (`MANIFEST.sha256`).
- CI has both fail-soft evidence upload and strict scheduled/manual evidence workflow.

### Phase 18 — Private Owner Context Continuity (Iteration 25)
- [x] Added private-flow continuity checks in create/update redirects and regression coverage.

**Exit criteria status:** met.
- Owners no longer self-lock out immediately after creating or privatizing a space.
- Regression is covered by automated component-level e2e tests.

### Phase 19 — Wallet-Authenticated Private Reads (Iteration 26)
- [x] Replaced URL-driven owner context with signed wallet-auth session (`nonce` -> `signMessage` -> `verify`).
- [x] Added server-side session validation for private route and global-search visibility checks.
- [x] Added explicit wallet-session controls in header (`Verify Private Access`) and private redirect flows.

**Exit criteria status:** met.
- Private route authorization no longer trusts query parameters.
- Viewer identity is cryptographically proven by the connected wallet.
- Private-read gating remains deterministic and demoable in 3–5 minutes.

### Phase 20 — Visual Identity + Readability System (Iteration 27)
- [x] Refreshed global design tokens (palette, spacing, radius, shadows) for stronger visual hierarchy and brand differentiation.
- [x] Corrected typography boundary: reading surfaces now use body serif while UI chrome/headings/buttons use heading font.
- [x] Upgraded interactive styling for buttons, cards, navigation, and focus rings with consistent accent semantics.
- [x] Improved background atmosphere and content contrast while keeping no-wallet browse UX intact.

**Exit criteria status:** met.
- Visual hierarchy is stronger and more judge-distinctive in home/space/page/settings views.
- Readability improved by separating body copy typography from interface typography.
- Interaction states are clearer and more consistent without changing Arkiv data behavior.

### Phase 21 — Progressive Disclosure of Technical Metadata (Iteration 28)
- [x] Added reusable disclosure surface for optional technical context (`Technical details`).
- [x] Moved canonical keys, retention controls, and lifecycle internals out of primary browse flow.
- [x] Simplified owner/write messaging to short action-oriented hints across authoring, transfer, lifecycle, and presence surfaces.
- [x] Kept full Arkiv transparency available on demand through expandable technical panels.

**Exit criteria status:** met.
- Default browse flow is less blockchain-jargon-heavy and easier to scan.
- Technical details remain accessible for judges without overwhelming first-time users.
- Owner gating guidance is consistent and task-oriented across write actions.

### Phase 22 — Search UX Simplification (Iteration 29)
- [x] Split search UX into a basic lane (query + status) and toggleable advanced lane (parent, owner, sort).
- [x] Added active-filter chips with one-click remove for each filter and global `Clear all`.
- [x] Added result summary copy on space/global search routes (`Showing X pages in Y scope`).
- [x] Extended filter serialization test coverage for advanced toggle and active-chip behavior.

**Exit criteria status:** met.
- Default search path is lighter for first-time users.
- Advanced controls remain available without crowding the primary interaction path.
- Active filter state is explicit and quickly reversible from the UI.

### Phase 23 — Authoring Experience Upgrade (Iteration 30)
- [x] Added markdown edit/preview tabs to create/edit page forms with shared reusable field component.
- [x] Added unsaved-change route-leave protection for page authoring forms (beforeunload + link navigation confirmation).
- [x] Reworked save/create feedback into inline callouts with post-write next-step CTAs (`Open page`, `Back to space`).
- [x] Added e2e coverage for preview-tab behavior and unsaved-change warning, plus regression compatibility for existing page-form tests.

**Exit criteria status:** met.
- Authors can switch between edit and preview without leaving the form.
- Unsaved changes are protected by explicit leave confirmation.
- Success and error states are clearer and actionable in-place.

## Current Verification Snapshot
- Last full pass: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` on 2026-03-01 (post iteration 26 wallet-auth visibility rollout).
- Result: lint/typecheck/unit/integration/e2e/build all pass; live test remains skip-safe when private key is absent.
- Iteration 27 check: `pnpm typecheck` pass on 2026-03-02 after visual-system refactor.
- Iteration 28 check: `pnpm typecheck` pass on 2026-03-02 after technical-details disclosure rollout.
- Iteration 29 check: `pnpm typecheck` + `pnpm test:e2e` pass on 2026-03-02 after search UX simplification and filter-chip rollout.
- Iteration 30 check: `pnpm typecheck` + `pnpm test:e2e` pass on 2026-03-02 after authoring UX (preview tabs + unsaved guard + callouts) rollout.
- Added passing integrity coverage for canonical selection + duplicate guards (`tests/integration/canonical-resolution.test.ts`, `tests/integration/create-conflict-guards.test.ts`).
- Added lifecycle hardening coverage (`tests/integration/edit-page-mutate.test.ts`, `tests/integration/create-page-repair.test.ts`).
- Added visibility/realtime coverage (`tests/unit/visibility-access.test.ts`, `tests/e2e/private-visibility-routes.test.tsx`, `tests/e2e/use-arkiv-events.test.tsx`).
- Added page lifecycle cleanup coverage (`tests/integration/delete-page-cleanup.test.ts`, `tests/e2e/page-lifecycle-form.test.tsx`).
- Added private owner-context continuity coverage (`tests/e2e/create-space-error-handling.test.tsx`, `tests/e2e/edit-space-owner.test.tsx`).
- Added wallet auth session integrity coverage (`tests/unit/wallet-auth-session.test.ts`).
- Added wallet-auth private-read session endpoints (`/api/auth/wallet/nonce`, `/api/auth/wallet/verify`, `/api/auth/wallet/session`, `/api/auth/wallet/logout`).
- Live write proof: `pnpm seed:demo` completed on Kaolin with funded key, creating/reading `arkiv-demo` and demo pages.
- Client tx observability: browser console now logs each wallet prompt under `[arkiv-tx:*]` and presence heartbeat lifecycle under `[presence-heartbeat]`.
- Evidence capture proof: `pnpm evidence:capture` generated deterministic screenshots and status report (`ARTIFACT_INDEX.md` + `report.json`).
- Evidence bundle now includes `MANIFEST.sha256` and walkthrough clip artifact (`clips/walkthrough-home-space-page-settings-trace.zip` fallback when video export is unavailable).
- Strict evidence proof: `EVIDENCE_FAIL_SOFT=0 pnpm evidence:capture` passes and records `realtime-two-tab` as captured (with explicit diagnostic fallback detail when direct two-tab observation times out).

## Next Bottlenecks (Optional Improvements)
1. Add child-page reparent policy controls for parent deletion (auto-root vs manual reparent prompt).
2. Add session revocation/refresh UX hardening (expiry countdown + proactive re-verify prompt).
3. Add reproducible public deployment pipeline + pinned demo URL for final submission handoff.

## Plan V1 (2026-02-25)
- See [planV1.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV1.md) for the next rubric-weighted iteration sequence.
- Priority order executed: space settings -> true page hierarchy -> query/discovery depth -> ownership transfer depth -> judge evidence pack (complete).

## Plan V2 (2026-03-01)
- See [planV2.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV2.md) for the next score-lift sequence focused on data integrity, lifecycle correctness, and submission hardening.

## Plan V3 (2026-03-01)
- See [planV3.md](/Users/tomas/Dev/Personal/arkiv-knowledge/planV3.md) for the UX/design-first score-lift sequence focused on visual identity, progressive disclosure, search ergonomics, mobile IA, and loading/empty/error states.
