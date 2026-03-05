# ITERATION_LOG.md

## How to Use
Add one entry per merged iteration. Keep entries short and evidence-first.

---

## Entry Template

### YYYY-MM-DD — Iteration N
- **Objective:**
- **Implemented:**
- **Rubric targets:** (integration / functionality / UX / code quality)
- **Expected score delta:** (low / medium / high)
- **Evidence:**
  - tests:
  - demo step:
  - notes/screenshots:
- **Next bottleneck:**

---

## Baseline
### 2026-02-24 — Iteration 0 (Planning Baseline)
- **Objective:** establish execution system from research report.
- **Implemented:** created operating docs (`AGENTS.md`, `PLAN.md`, `EXPLANATIONS.md`, `DEMO_SCRIPT.md`, this log).
- **Rubric targets:** code quality/documentation (primary), integration planning (secondary).
- **Expected score delta:** medium.
- **Evidence:** repository docs aligned to `planV0.md` strategic findings.
- **Next bottleneck:** bootstrap runnable app and first Arkiv read/write smoke path.

### 2026-02-24 — Iteration 1 (Phase 0)
- **Objective:** bootstrap production-ready app scaffold and Arkiv connectivity.
- **Implemented:** Next.js 15 app shell, Arkiv public/wallet clients, verify pipeline, live smoke script.
- **Rubric targets:** integration / functionality / code quality.
- **Expected score delta:** high.
- **Evidence:**
  - tests: `pnpm verify` pass.
  - demo step: public browse on `/`, wallet write path via `/new/space`.
  - notes/screenshots: CI workflow added.
- **Next bottleneck:** schema determinism + lifecycle contracts.

### 2026-02-24 — Iteration 2 (Phase 1)
- **Objective:** implement deterministic schema model.
- **Implemented:** builders/parsers for `kb.space`, `kb.page`, `kb.revision`, `kb.link`, `kb.presence`; expiration matrix.
- **Rubric targets:** integration.
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/unit/schema-builders.test.ts`, `tests/unit/parser.test.ts`, `tests/unit/expiration.test.ts`.
  - demo step: explain schema table and TTL policy.
  - notes/screenshots: `README.md` schema section.
- **Next bottleneck:** canonical update + revision write path.

### 2026-02-24 — Iteration 3 (Phase 2)
- **Objective:** complete spaces/pages MVP with revision lifecycle.
- **Implemented:** public list/detail routes, create page, edit page with `mutateEntities` update+create flow.
- **Rubric targets:** integration / functionality / UX.
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/integration/edit-page-mutate.test.ts`.
  - demo step: edit one page twice and show stable canonical key + growing revisions.
  - notes/screenshots: edit route and revision panel implemented.
- **Next bottleneck:** relationship depth and query-first search.

### 2026-02-24 — Iteration 4 (Phase 3)
- **Objective:** persist and visualize inter-page relationships.
- **Implemented:** wiki-link extraction, `kb.link` write replacement, backlinks view, query-predicate search.
- **Rubric targets:** integration / functionality.
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/unit/link-extractor.test.ts`, `tests/integration/search-predicates.test.ts`.
  - demo step: add `[[link]]` and show backlink list from Arkiv query.
  - notes/screenshots: query paths documented in README.
- **Next bottleneck:** expiration-native collaboration signals.

### 2026-02-24 — Iteration 5 (Phase 4)
- **Objective:** implement expiration strategy as visible product behavior.
- **Implemented:** presence join/heartbeat/leave, near-expiry extension actions for owners, TTL badges.
- **Rubric targets:** integration / UX.
- **Expected score delta:** high.
- **Evidence:**
  - tests: expiration policy tests + verify pass.
  - demo step: join presence, watch active viewer list, leave/expire.
  - notes/screenshots: `PresencePanel` and extension controls.
- **Next bottleneck:** realtime reliability proof.

### 2026-02-24 — Iteration 6 (Phase 5)
- **Objective:** realtime signal and fallback resilience.
- **Implemented:** `subscribeEntityEvents` refresh hook with polling fallback.
- **Rubric targets:** integration / functionality.
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: full `pnpm verify` pass.
  - demo step: two-session edit refresh and presence updates.
  - notes/screenshots: `useArkivEvents` hook.
- **Next bottleneck:** submission narrative hardening.

### 2026-02-24 — Iteration 7 (Phase 6)
- **Objective:** judge-ready packaging and reproducibility.
- **Implemented:** README architecture+queries, seed/restore scripts, phase verifier, updated demo script/docs.
- **Rubric targets:** code quality / documentation / UX.
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `pnpm verify` pass, live test skip-safe without key.
  - demo step: 3–5 minute walkthrough in `DEMO_SCRIPT.md`.
  - notes/screenshots: CI (`.github/workflows/ci.yml`), seed scripts.
- **Next bottleneck:** optional Playwright two-tab capture for stronger realtime proof artifact.

### 2026-02-25 — Iteration 8 (Network Migration)
- **Objective:** stabilize read/write reliability during Mendoza sync instability.
- **Implemented:** switched default Arkiv chain/rpc assumptions from Mendoza to Kaolin across app config, providers, seed/live scripts, and tests.
- **Rubric targets:** integration / functionality / code quality.
- **Expected score delta:** medium.
- **Evidence:**
  - tests: `pnpm verify` pass after migration.
  - demo step: run app and seed flow on Kaolin endpoints.
  - notes/screenshots: README env examples updated for Kaolin.
- **Next bottleneck:** validate real write path and remove live-flow regressions.

### 2026-02-25 — Iteration 9 (Live Write Regression Fixes)
- **Objective:** make real wallet/create flows deterministic under live chain conditions.
- **Implemented:** replaced duplicate `token` annotations with deterministic token slots (`token_0..token_19`), updated query predicates, fixed near-expiry bigint/number crash path, added same-origin Arkiv RPC proxy for wallet read transport, and verified browser routing with seeded dataset.
- **Rubric targets:** integration / functionality / UX / code quality.
- **Expected score delta:** high.
- **Evidence:**
  - tests: `pnpm verify` pass; schema/search tests updated.
  - demo step: `pnpm seed:demo` succeeds on Kaolin and `/` -> `/spaces/arkiv-demo` -> page routes render in Playwright.
  - notes/screenshots: Playwright snapshots confirm public browse with seeded space/pages.
- **Next bottleneck:** add deterministic two-tab realtime browser artifact for final proof strength.

### 2026-02-25 — Iteration 10 (Wallet Failure Hardening)
- **Objective:** eliminate opaque browser wallet failures for create-space and join-presence flows.
- **Implemented:** switched wallet write flow to use injected wallet for signing plus Arkiv public receipt polling, strengthened write preflight with provider/public balance checks, and added explicit actionable messaging for `Transaction failed: undefined`.
- **Rubric targets:** integration / functionality / UX.
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `pnpm verify` pass with added wallet preflight/error unit coverage.
  - demo step: create/join flows now block early with explicit network/funding errors instead of opaque tx failure.
  - notes/screenshots: failure mode reproduced from user report and addressed in wallet pipeline.
- **Next bottleneck:** add dedicated browser automation covering wallet-connected write flows when a test wallet is available.

### 2026-02-25 — Iteration 11 (Provider Error Pass-Through)
- **Objective:** expose real wallet/provider rejection reasons to users during write failures.
- **Implemented:** forced browser RPC transport through same-origin proxy and wrapped `sendTransaction` to rethrow provider errors as `EntityMutationError` (preserved through Arkiv SDK boundaries).
- **Rubric targets:** functionality / UX / integration.
- **Expected score delta:** medium.
- **Evidence:**
  - tests: `pnpm verify` pass after transport + error-wrapper changes.
  - demo step: failed writes now report provider-level reason text when available.
  - notes/screenshots: user-reported generic fallback flow addressed in transaction send path.
- **Next bottleneck:** add connected-wallet browser automation fixture to assert full write success path in CI-like runs.

### 2026-02-25 — Iteration 12 (Connector Provider Alignment)
- **Objective:** ensure writes use the exact wallet provider selected in RainbowKit/wagmi.
- **Implemented:** `useArkivWalletClient` now resolves provider via active wagmi connector (`connector.getProvider`) instead of global `window.ethereum`, preventing multi-wallet provider mismatch failures.
- **Rubric targets:** functionality / UX / integration.
- **Expected score delta:** medium.
- **Evidence:**
  - tests: `pnpm verify` pass after connector-provider refactor.
  - demo step: connected wallet flow now uses selected connector provider for all writes.
  - notes/screenshots: browser automation confirmed contexts without injected provider surface no connector provider.
- **Next bottleneck:** execute full browser write flow with an automation-capable wallet extension fixture.

### 2026-02-25 — Iteration 13 (Tx Prompt Logging)
- **Objective:** make every wallet popup attributable and debuggable from browser console.
- **Implemented:** added centralized tx prompt logs (`[arkiv-tx:prompt|submitted|failed]`) and presence heartbeat lifecycle logs (`[presence-heartbeat]`), plus intent logs on create-space/join/leave actions.
- **Rubric targets:** functionality / UX / code quality.
- **Expected score delta:** medium.
- **Evidence:**
  - tests: `pnpm verify` pass with logging-enabled components.
  - demo step: open console during presence join to see periodic heartbeat-triggered tx prompts.
  - notes/screenshots: tx payload and hash now visible for every wallet prompt path.
- **Next bottleneck:** add per-operation IDs in logs to correlate UI action -> tx hash across multi-step mutation flows.

### 2026-02-25 — Iteration 14 (BookStack UX Migration)
- **Objective:** raise judged usability by aligning IA and visual hierarchy with BookStack-style documentation UX.
- **Implemented:** refactored global shell to persistent left navigation (space hierarchy), added breadcrumbs across browse/create/edit routes, converted space/page views from loose cards into denser list-first documentation layouts, and tuned typography/styling toward content-first reading.
- **Rubric targets:** UX (primary) / functionality (secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `pnpm verify` pass after full layout refactor.
  - demo step: show fast navigation using sidebar + breadcrumbs from `/` -> `/spaces/[spaceSlug]` -> `/spaces/[spaceSlug]/[pageSlug]`.
  - notes/screenshots: BookStack-like IA now visible directly in app shell and route layouts.
- **Next bottleneck:** capture and attach deterministic UI screenshots/video artifact for submission package.

### 2026-02-25 — Iteration 15 (Owner-Managed Space Settings)
- **Objective:** close functionality gap for space settings with explicit ownership semantics.
- **Implemented:** added `/spaces/[spaceSlug]/settings` route + `EditSpaceForm`, wired owner-only `updateSpace` flow, preserved `createdAt` during space updates, and exposed `Space Settings` entry point from space page toolbar.
- **Rubric targets:** functionality (primary) / integration (secondary) / UX (secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/integration/update-space-settings.test.ts`, `tests/e2e/edit-space-owner.test.tsx`, `tests/e2e/edit-space-non-owner.test.tsx`.
  - demo step: open settings route, show non-owner read-only guard, switch to owner wallet and update space metadata.
  - notes/screenshots: settings route breadcrumbs and owner-only messaging are visible without wallet for read path.
- **Next bottleneck:** implement true page hierarchy UX (`parentPageKey` authoring + nested rendering) for iteration 16.

### 2026-02-25 — Iteration 16 (True Page Hierarchy)
- **Objective:** deliver full hierarchy authoring, navigation, and query behavior around `parentPageKey`.
- **Implemented:** added reusable hierarchy tree utilities and nested nav component; wired parent selectors into create/edit flows with cycle-safe guards; rendered nested tree sidebars; added ancestor breadcrumbs; and introduced hierarchy-aware space search predicates (`all`, `root`, `child`).
- **Rubric targets:** functionality (primary) / integration (secondary) / UX (secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/unit/tree.test.ts`, `tests/integration/page-parent-write-path.test.ts`, `tests/integration/search-predicates.test.ts`, `tests/e2e/create-page-parent-selector.test.tsx`, `tests/e2e/edit-page-parent-guard.test.tsx`.
  - demo step: create root + child pages, reparent safely, and show nested sidebar + ancestor breadcrumbs + parent filter behavior.
  - notes/screenshots: hierarchy tree now renders in both `/spaces/[spaceSlug]` and `/spaces/[spaceSlug]/[pageSlug]` sidebars.
- **Next bottleneck:** implement ownership transfer depth for canonical entities (iteration 17).

### 2026-02-25 — Iteration 17 (Ownership Depth + Transfer)
- **Objective:** make ownership lifecycle judge-visible beyond write gating with canonical transfer + owner-aware authoring.
- **Implemented:** added Arkiv `changeOwnership` mutation wrappers; added owner-only transfer forms for space settings and page detail; gated create/edit page forms by owner with explicit reason text; and added `Owned by me`/`Any owner` query chips wired to `ownedBy(...)`.
- **Rubric targets:** integration (primary) / functionality (secondary) / UX (secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/integration/ownership-transfer.test.ts`, `tests/e2e/transfer-ownership-form.test.tsx`, `tests/e2e/create-page-owner-guard.test.tsx`, `tests/e2e/edit-page-owner-guard.test.tsx`, `tests/unit/ownership-permissions.test.ts`.
  - demo step: transfer space/page ownership as owner wallet, refresh route, and show old owner blocked while new owner regains edit/transfer controls.
  - notes/screenshots: transfer forms visible at `/spaces/[spaceSlug]/settings` and `/spaces/[spaceSlug]/[pageSlug]` with non-owner guard text.
- **Next bottleneck:** package deterministic realtime + screenshot evidence artifacts (iteration 19).

### 2026-02-25 — Iteration 18 (Query + Discovery Depth)
- **Objective:** expand judge-visible query power with sort/owner controls and cross-space page discovery while keeping Arkiv-first reads.
- **Implemented:** added sort-aware page query model, global page search input + Arkiv predicate builder, cross-space search route (`/search/pages`), owner/sort filters in space and global search UI, and dev-only query debug panel.
- **Rubric targets:** functionality (primary) / integration (secondary) / UX (secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `tests/integration/search-predicates.test.ts` (global + parent-mode predicate coverage), `tests/e2e/space-search-form-filters.test.tsx` (query param serialization for q/status/parent/owner/sort).
  - demo step: run `/search/pages` with owner + status + parent + sort controls, then open `/spaces/[spaceSlug]` and show the same filter semantics in space scope.
  - notes/screenshots: global search entry is available in top navigation; query debug panel prints normalized predicates in dev mode.
- **Next bottleneck:** deterministic realtime + screenshot evidence pack automation (iteration 19).

### 2026-02-25 — Iteration 19 (Judge Evidence Pack)
- **Objective:** convert rubric claims into deterministic artifacts and reduce judge/demo ambiguity.
- **Implemented:** added `scripts/capture-evidence.ts` for deterministic Playwright capture, added optional two-tab realtime mutation proof with skip-safe reporting, added `SUBMISSION_EVIDENCE.md`, added `verify:evidence` gate in `pnpm verify`, and added fail-soft CI artifact upload.
- **Rubric targets:** code quality/docs (primary) / UX demo reliability (secondary) / integration evidence (secondary).
- **Expected score delta:** medium.
- **Evidence:**
  - tests/verification: `pnpm verify` (includes `pnpm verify:evidence`) and `pnpm evidence:capture`.
  - demo step: open `output/playwright/evidence-pack/ARTIFACT_INDEX.md` and show route screenshots + realtime status entry.
  - notes/screenshots: captured artifacts in `output/playwright/evidence-pack/screenshots/`; realtime marked skip-safe without funded key.
- **Next bottleneck:** automate wallet-extension-backed realtime proof in CI to eliminate skip path.

### 2026-03-01 — Iteration 20 (Canonical Identity + Slug Integrity)
- **Objective:** eliminate slug-collision ambiguity and strengthen canonical read/write integrity.
- **Implemented:** added deterministic canonical selection in slug lookups (`kb.space`, `kb.page`); added `spaceKey`-anchored page listing/lookup/query paths for core space/page routes; added create-time conflict guards for duplicate `spaceSlug` and duplicate page slug inside canonical space; and constrained wiki-link resolution to canonical `spaceKey`.
- **Rubric targets:** functionality (`data integrity`, primary) / integration (`ownership + relationships`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/integration/canonical-resolution.test.ts`, `tests/integration/create-conflict-guards.test.ts`, plus updated `tests/integration/search-predicates.test.ts`.
  - verification: `pnpm test`, `pnpm test:e2e`, `pnpm typecheck`, `pnpm build`.
  - demo step: attempt duplicate space/page slug creation (blocked), then browse `/spaces/[spaceSlug]/[pageSlug]` showing canonical `spaceKey`-scoped reads.
- **Next bottleneck:** preserve `kb.page.payload.createdAt` on edit and harden revision sequencing under concurrent writes (Iteration 21).

### 2026-03-01 — Iteration 21 (Lifecycle Correctness Hardening)
- **Objective:** fix page lifecycle metadata drift and harden revision sequencing + create-flow recovery.
- **Implemented:** `editPage` now preserves canonical `createdAt`; revision numbering now derives from `max(revisionNo)+1`; and `createPage` now includes follow-up mutation compensation (failure logging + revision repair attempt + best-effort link repair + actionable failure guidance).
- **Rubric targets:** functionality (`data integrity`, primary) / integration (`advanced lifecycle behavior`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: updated `tests/integration/edit-page-mutate.test.ts` (createdAt stability + revision sequencing), added `tests/integration/create-page-repair.test.ts` (repair success/failure paths).
  - verification: `pnpm test`, `pnpm test:e2e`, `pnpm typecheck`, `pnpm build`, `pnpm verify`.
  - demo step: edit same page twice and show stable created timestamp + monotonic revisions; mention create-flow repair behavior for failed follow-up mutation scenarios.
- **Next bottleneck:** enforce `public/unlisted/private` visibility semantics consistently across read/query routes (Iteration 22).

### 2026-03-01 — Iteration 22 (Visibility Enforcement + Strict Evidence Reliability)
- **Objective:** enforce space visibility semantics in browse/search paths and remove strict evidence flakiness in realtime proof capture.
- **Implemented:** added visibility access helpers; enforced private-route read guards across space/page/new/edit/settings routes; filtered public listings to public-only; filtered global search results by visible spaces; hardened `capture-evidence` realtime probe with write confirmation, tab targeting, command timeouts, and diagnostic fallback; added strict evidence CI workflow.
- **Rubric targets:** functionality (`core flows`, primary) / integration (`query + lifecycle proof`, secondary) / code quality-docs (`evidence reproducibility`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `tests/unit/visibility-access.test.ts`, `tests/e2e/private-visibility-routes.test.tsx`, `tests/e2e/use-arkiv-events.test.tsx`.
  - verification: `pnpm verify`, `EVIDENCE_FAIL_SOFT=0 EVIDENCE_SESSION=evidence-pack-strict4 pnpm evidence:capture`.
  - demo step: set a space to private, show anonymous 404 for `/spaces/[spaceSlug]`, then open as authenticated owner and show settings access; run global search and show private pages excluded for non-owner context.
  - notes/screenshots: strict report at `output/playwright/evidence-pack/report.json` with `realtime-two-tab` captured status; CI workflow at `.github/workflows/evidence-strict.yml`.
- **Next bottleneck:** Iteration 23 archive/delete lifecycle completeness (canonical archive + relationship cleanup policy).

### 2026-03-01 — Iteration 23 (Archive/Delete Lifecycle Completeness)
- **Objective:** close lifecycle management gap with owner-visible archive/delete actions and deterministic relationship cleanup.
- **Implemented:** added owner-only `PageLifecycleForm` to page detail; added `archivePage` mutation helper; added `deletePageWithCleanup` mutation deleting canonical `kb.page` plus related `kb.link`, `kb.presence`, and `kb.revision` entities in one mutation; documented retention policy in README.
- **Rubric targets:** functionality (`manage flows`, primary) / integration (`entity lifecycle`, secondary) / UX (`owner boundaries`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `tests/integration/delete-page-cleanup.test.ts`, `tests/e2e/page-lifecycle-form.test.tsx`.
  - verification: `pnpm verify` pass with lifecycle tests included.
  - demo step: archive page from detail route, then delete a page with slug confirmation and show return to `/spaces/[spaceSlug]` without orphan relationship panels.
  - notes/screenshots: lifecycle controls visible on `/spaces/[spaceSlug]/[pageSlug]` with owner/disconnected guard messaging.
- **Next bottleneck:** Iteration 24 judge-optimized submission packaging and verification.

### 2026-03-01 — Iteration 24 (Judge-Optimized Submission Assets)
- **Objective:** improve judging speed/confidence with explicit submission sections, committed visual assets, and automated submission verification.
- **Implemented:** upgraded README with team/demo/architecture/screenshot sections; added committed screenshots under `public/submission/`; added `scripts/verify-submission.ts` + `pnpm verify:submission` and integrated into `pnpm verify` + CI; extended evidence capture output with walkthrough clip artifact (video when available, trace fallback otherwise) and `MANIFEST.sha256`.
- **Rubric targets:** code quality/docs (primary) / demo reliability (secondary).
- **Expected score delta:** medium.
- **Evidence:**
  - tests/verification: `pnpm verify:submission`, `pnpm verify`, `pnpm evidence:capture`.
  - demo step: open README submission sections and `output/playwright/evidence-pack/` to show screenshots + walkthrough clip artifact + hash manifest.
  - notes/screenshots: evidence report now includes `walkthrough-clip`; hash manifest generated at `output/playwright/evidence-pack/MANIFEST.sha256`.
- **Next bottleneck:** harden private-owner context from query-param viewer to signed/session proof for stronger production-grade privacy guarantees.

### 2026-03-01 — Iteration 25 (Private Owner Context Continuity)
- **Objective:** eliminate owner self-lockout after creating a private space or switching visibility to private.
- **Implemented:** reinforced private-flow continuity after create/settings updates and added regression tests for both redirect paths.
- **Rubric targets:** integration (`visibility lifecycle continuity`, primary) / functionality (`private route reliability`, secondary) / UX (`demo flow robustness`, secondary).
- **Expected score delta:** medium.
- **Evidence:**
  - tests: `tests/e2e/create-space-error-handling.test.tsx`, `tests/e2e/edit-space-owner.test.tsx`.
  - verification: `pnpm test:e2e -- tests/e2e/create-space-error-handling.test.tsx tests/e2e/edit-space-owner.test.tsx`, `pnpm typecheck`.
  - demo step: create a private space and confirm immediate redirect opens the private route (authenticated owner context) instead of `notFound()`; repeat by changing an existing space to private from settings.
  - notes/screenshots: route continuity now survives visibility transitions without manual query editing.
- **Next bottleneck:** remove URL-based owner-context bypass with wallet-authenticated private-read session (Iteration 26).

### 2026-03-01 — Iteration 26 (Wallet-Authenticated Private Reads)
- **Objective:** replace insecure URL-driven private access (`?viewer=`) with connected-wallet validation.
- **Implemented:** added wallet auth challenge/session endpoints (`/api/auth/wallet/nonce`, `/api/auth/wallet/verify`, `/api/auth/wallet/session`, `/api/auth/wallet/logout`); switched private route and global-search visibility checks to server-validated signed wallet session; removed `viewer` query propagation from routes/components; updated create/update private-space flows to verify wallet session before redirect; added header control `Verify Private Access`.
- **Rubric targets:** integration (`ownership + visibility security`, primary) / functionality (`private route correctness`, secondary) / UX (`demo reliability`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/e2e/private-visibility-routes.test.tsx`, `tests/e2e/create-space-error-handling.test.tsx`, `tests/e2e/edit-space-owner.test.tsx`.
  - verification: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.
  - demo step: connect owner wallet, click `Verify Private Access`, open private space/settings successfully; change wallet/disconnect and show private route denied unless wallet session is re-verified.
  - notes/screenshots: private-read auth no longer depends on URL params, and links/routes no longer carry `viewer`.
- **Next bottleneck:** add session revocation/refresh UX hardening and public deployment reproducibility polish.

### 2026-03-02 — Iteration 27 (Visual Identity + Readability System)
- **Objective:** raise judged UX/design perception with a stronger visual system and clearer reading hierarchy.
- **Implemented:** refreshed global theme tokens (palette/spacing/radius/shadows), upgraded button/card/list/nav interaction styling, added richer background atmosphere, and corrected typography boundary so body content uses `--font-body` while headings/UI chrome/actions use `--font-heading`.
- **Rubric targets:** UX (`visual design`, primary) / UX (`user experience`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: N/A (styling-focused iteration).
  - verification: `pnpm typecheck`.
  - demo step: start at `/` and quickly compare browse readability and CTA prominence across `/`, `/spaces/[spaceSlug]`, `/spaces/[spaceSlug]/[pageSlug]`, and `/spaces/[spaceSlug]/settings`.
  - notes/screenshots: updated visual system is centralized in `src/app/globals.css`; typography boundary fix in `src/app/layout.tsx`.
- **Next bottleneck:** Iteration 28 progressive disclosure of technical metadata (reduce blockchain jargon in default browse flow).

### 2026-03-02 — Iteration 28 (Progressive Disclosure for Technical Metadata)
- **Objective:** make default browsing/writing flows less technical while keeping Arkiv detail accessible on demand.
- **Implemented:** added reusable `TechnicalDetails` disclosure component; moved canonical keys, retention details, and lifecycle internals into collapsible panels on space/page/settings/presence surfaces; simplified primary copy to user-task language; standardized owner/write hints to concise action guidance.
- **Rubric targets:** UX (`blockchain abstraction`, primary) / UX (`user experience`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: N/A (presentation and copy-focused iteration).
  - verification: `pnpm typecheck`.
  - demo step: open `/spaces/[spaceSlug]/[pageSlug]`, show clean default read flow, then expand `Technical details` to reveal canonical key, retention controls, and Arkiv-specific lifecycle context.
  - notes/screenshots: disclosure component at `src/app/_components/technical-details.tsx`; route/form integrations across space/page/settings/presence and edit/create flows.
- **Next bottleneck:** Iteration 29 search UX simplification (basic vs advanced filters + active filter chips).

### 2026-03-02 — Iteration 29 (Search UX Simplification)
- **Objective:** reduce search cognitive load while preserving advanced Arkiv query controls.
- **Implemented:** refactored `SpaceSearchForm` into basic + advanced lanes; added active-filter chips with one-click remove and `Clear all`; added result summary copy on space/global search routes; extended search-form test coverage for advanced toggle and chip removal behavior; updated owner-guard copy expectations in existing e2e tests to match standardized messaging.
- **Rubric targets:** UX (`user experience`, primary) / functionality (`filtering & search`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `tests/e2e/space-search-form-filters.test.tsx` (advanced controls + chip clear coverage), plus updated owner-guard expectation tests.
  - verification: `pnpm typecheck`, `pnpm test:e2e`.
  - demo step: run a basic query first, open advanced filters for owner/parent/sort, then remove one constraint from active chips and use `Clear all`.
  - notes/screenshots: search UX component changes in `src/app/_components/space-search-form.tsx`; result-summary updates in space/global search routes.
- **Next bottleneck:** Iteration 30 authoring UX upgrade (edit/preview tabs + unsaved-change guard).

### 2026-03-02 — Iteration 30 (Authoring Experience Upgrade)
- **Objective:** improve page authoring confidence and flow completion quality.
- **Implemented:** introduced shared markdown edit/preview field for create/edit forms; added unsaved-change leave guard hook (`beforeunload` + link-leave confirmation) to authoring surfaces; replaced status fragments with inline success/error callouts; added post-write next-step CTAs (`Open page`, `Back to space`) after successful save/create.
- **Rubric targets:** UX (`user experience`, primary) / functionality (`core flows work`, secondary).
- **Expected score delta:** medium.
- **Evidence:**
  - tests: added `tests/e2e/page-authoring-ux.test.tsx` (preview tabs + unsaved leave warning), updated existing page form e2e regressions.
  - verification: `pnpm typecheck`, `pnpm test:e2e`.
  - demo step: edit a page, switch to preview, attempt to leave with unsaved edits (show confirm), save changes, then use CTA buttons to navigate.
  - notes/screenshots: new shared components/hooks in `src/app/_components/markdown-editor-field.tsx` and `src/features/forms/useUnsavedChangesGuard.ts`.
- **Next bottleneck:** Iteration 31 mobile-first navigation and action ergonomics.

### 2026-03-02 — Iteration 31 (Mobile-First Navigation + Action Ergonomics)
- **Objective:** improve mobile browse/write ergonomics and navigation clarity for judge-visible responsive behavior.
- **Implemented:** added explicit mobile drawer navigation with open/close controls and route-change auto-close; preserved desktop sidebar pattern while reducing mobile header action crowding; introduced sticky mobile action bars for create/edit/settings/search apply actions; enforced 44px minimum touch-target baseline on core controls.
- **Rubric targets:** UX (`responsive design`, primary) / UX (`user experience`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: added `tests/e2e/mobile-ux-states.test.tsx` (drawer open/close/path-change behavior + retry primitive path).
  - verification: `pnpm typecheck`, `pnpm test:e2e`.
  - demo step: switch to mobile width, open drawer nav, navigate to create/edit/search flows, and show sticky submit/apply controls while scrolling.
  - notes/screenshots: mobile IA + action ergonomics implemented in `src/app/_components/mobile-nav-drawer.tsx`, `src/app/_components/app-shell.tsx`, and `src/app/globals.css`.
- **Next bottleneck:** Iteration 32 loading/empty/error state unification and retry affordances.

### 2026-03-02 — Iteration 32 (Loading/Empty/Error States Unification)
- **Objective:** make degraded/loading/empty route states consistent, actionable, and demo-stable.
- **Implemented:** introduced shared route feedback components (`RouteStateCard`, `RouteLoadingState`, `RetryButton`); added route-level loading skeletons for home/space/page/search/settings; migrated key empty states to task-oriented CTA cards; replaced static degraded-read warnings with explicit retry controls.
- **Rubric targets:** UX (`user experience`, primary) / functionality (`error handling`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: `tests/e2e/mobile-ux-states.test.tsx` (retry primitive), full e2e regression suite for route copy/state integrations.
  - verification: `pnpm typecheck`, `pnpm test:e2e`.
  - demo step: trigger/loading transition to show skeleton states, run a filtered search with no matches to show CTA empty state, then simulate degraded read path and use retry action.
  - notes/screenshots: shared state components in `src/app/_components/route-state-card.tsx`, `src/app/_components/route-loading-state.tsx`, and route updates across home/search/space/page/new/edit/settings.
- **Next bottleneck:** refresh submission evidence captures to include new mobile and recovery-state walkthrough screenshots.

### 2026-03-04 — Iteration 33 (Server-Delegated Presence Lifecycle)
- **Objective:** remove wallet transaction signing friction from `kb.presence` create/renew flows by centralizing execution on a server-owned key.
- **Implemented:** added server-only presence signer client (`src/arkiv/server-presence-client.ts`); added centralized node runtime route (`/api/presence`) supporting join (`POST`), renew (`PATCH`), leave (`DELETE`); migrated `PresencePanel` and `usePresenceHeartbeat` to API-based flow; replaced wallet-client presence mutations with server API client wrappers.
- **Rubric targets:** integration (`advanced lifecycle orchestration`, primary) / UX (`write friction reduction`, secondary) / functionality (`presence reliability`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: added `tests/unit/presence-mutations.test.ts`; verification via `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
  - demo step: open page detail, click `Join Presence`, show no wallet transaction popup while active viewer list updates and heartbeat renewals continue.
  - notes/screenshots: delegated signer route in `src/app/api/presence/route.ts`; server signer config via `ARKIV_PRESENCE_PRIVATE_KEY`.
- **Next bottleneck:** refresh evidence capture artifacts so the walkthrough explicitly shows presence join/renew without wallet transaction prompts.

### 2026-03-04 — Iteration 34 (Automatic Presence While Connected)
- **Objective:** remove manual presence controls so connected wallets are handled automatically.
- **Implemented:** refactored `PresencePanel` to auto-join when wallet is connected, auto-leave on disconnect/account switch/unmount, and removed `Join Presence`/`Leave` buttons; retained delegated server signer + heartbeat renewal path.
- **Rubric targets:** UX (`frictionless collaboration`, primary) / integration (`presence lifecycle completeness`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: added `tests/e2e/presence-panel-auto.test.tsx`; verification via `pnpm lint`, `pnpm typecheck`, `pnpm test:e2e`, `pnpm build`.
  - demo step: open a page with wallet connected and show active presence appears automatically (no button click, no wallet tx popup).
  - notes/screenshots: auto lifecycle logic in `src/app/_components/presence-panel.tsx`.
- **Next bottleneck:** update evidence capture walkthrough to explicitly show auto-presence activation/deactivation in the recorded flow.

### 2026-03-04 — Iteration 35 (GitBook Migration Compatibility)
- **Objective:** make GitBook-to-Arkiv markdown migration seamless and judge-observable with both UI and script paths.
- **Implemented:** added shared GitBook markdown normalizer (`src/features/migration/gitbook-markdown.ts`), integrated normalization into page read/preview and create/edit mutations, added migration route (`/migrate/gitbook`) + reusable converter component, added one-click authoring action (`Normalize GitBook Markdown`), and added CLI script (`pnpm migrate:gitbook`).
- **Rubric targets:** functionality (`migration/import readiness`, primary) / integration (`write-path compatibility + deterministic rendering`, secondary) / UX (`low-friction onboarding`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: added `tests/unit/gitbook-markdown.test.ts`, `tests/e2e/gitbook-migration-tool.test.tsx`; extended `tests/e2e/page-authoring-ux.test.tsx`.
  - verification: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
  - demo step: open `/migrate/gitbook`, paste GitBook markdown, show converted output/preview, then paste into create/edit form and run one-click normalization.
  - notes/screenshots: migration tooling in `src/app/migrate/gitbook/page.tsx`, `src/app/_components/gitbook-migration-tool.tsx`, and `scripts/migrate-gitbook-markdown.ts`.
- **Next bottleneck:** extend converter for multi-file GitBook exports (folder-aware link remapping) and add deterministic batch migration demo fixture.

### 2026-03-04 — Iteration 36 (Owner CTA Relocation + Edit Entry Gating)
- **Objective:** keep read routes free of owner-specific cards/CTAs for non-owner viewers and consolidate owner controls into the edit route.
- **Implemented:** removed page lifecycle + page ownership transfer cards from `/spaces/[spaceSlug]/[pageSlug]`; moved those cards to `/spaces/[spaceSlug]/[pageSlug]/edit`; added owner-verified client CTA gate so `Edit Page` is disabled unless connected owner wallet + verified owner session are present.
- **Rubric targets:** UX (`permission clarity`, primary) / integration (`ownership model visibility`, secondary) / functionality (`route-level action correctness`, secondary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - tests: added `tests/e2e/owner-edit-page-cta.test.tsx`; verification via `pnpm lint`, `pnpm typecheck`, `pnpm test:e2e`, `pnpm build`.
  - demo step: open page route as non-owner/disconnected viewer and show no owner cards + disabled edit CTA; switch to owner verified session and show edit CTA enabled with lifecycle/transfer cards on edit route.
  - notes/screenshots: gating and relocation in `src/app/spaces/[spaceSlug]/[pageSlug]/page.tsx`, `src/app/_components/owner-edit-page-cta.tsx`, and `src/app/spaces/[spaceSlug]/[pageSlug]/edit/page.tsx`.
- **Next bottleneck:** refresh evidence capture script to explicitly include read-route non-owner CTA suppression and edit-route owner-card visibility.

### 2026-03-05 — Iteration 37 (Agent-Friendly REST API + Official Skill)
- **Objective:** make the app first-class AI-agent consumable with deterministic read APIs, owner-safe write intents, and an official skill entrypoint.
- **Implemented:** added versioned `/api/agent/v1` read routes (`meta`, `openapi`, `auth/session`, spaces/page/revisions/backlinks/global search); added wallet-session-gated write-intent routes for space/page CRUD+lifecycle+transfer+extend; added agent presence wrappers with viewer spoof protection; added shared agent contract layer (`src/features/agent/*`), intent execution helper (`executeAgentIntent`), and root `SKILL.md`; extracted shared write-plan builders (`src/arkiv/mutations/plans.ts`) and refactored mutation modules to reuse them.
- **Rubric targets:** integration (`machine-facing Arkiv integration depth`, primary) / functionality (`agent interoperability`, secondary) / code quality-docs (`official skill + OpenAPI`, secondary).
- **Expected score delta:** high.
- **Evidence:**
  - tests: `tests/unit/agent-read-api-routes.test.ts`, `tests/unit/agent-intent-auth-routes.test.ts`, `tests/integration/agent-intents.test.ts`, `tests/unit/agent-presence-routes.test.ts`, `tests/unit/agent-openapi.test.ts`, `tests/unit/agent-execute-intent.test.ts`.
  - verification: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.
  - demo step: open `SKILL.md`, call `/api/agent/v1/meta` + `/api/agent/v1/openapi`, then call one read endpoint and one write-intent endpoint and show `sdkCall` + `postconditions`.
  - notes/screenshots: new route inventory visible in Next build output under `/api/agent/v1/*`.
- **Next bottleneck:** add deterministic CLI fixture that executes returned intents against a connected wallet to produce repeatable tx-level artifacts for judge evidence.

### 2026-03-05 — Iteration 38 (Code Quality & Docs Lift)
- **Objective:** raise Code Quality & Docs rubric confidence with judge-friendly engineering documentation and non-blocking docs quality reporting.
- **Implemented:** added engineering docs bundle (`docs/README.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY_MODEL.md`, `docs/QUALITY_STANDARDS.md`, `docs/RUBRIC_QUALITY_MAP.md`) plus root `CONTRIBUTING.md`; added `scripts/verify-docs-quality.ts` and `pnpm verify:docs-quality`; added non-blocking CI docs quality step + artifact upload in `.github/workflows/ci.yml`; updated `README.md` and `SUBMISSION_EVIDENCE.md` to surface new quality/doc artifacts in judge path.
- **Rubric targets:** code quality-docs (`README clarity`, `code organization clarity`, `quality process visibility`, primary).
- **Expected score delta:** medium-high.
- **Evidence:**
  - verification: `pnpm lint`, `pnpm typecheck`, `pnpm verify:docs-quality`, `pnpm verify:submission`, `pnpm test`, `pnpm test:e2e`.
  - artifact/report: `output/docs-quality/report.json` with summary `{ errors: 0, warnings: 0, filesScanned: 12 }`.
  - local checker probes (fixture root, no tracked-file mutation): missing-heading case reported `errors: 1` with `MISSING_HEADING`; broken-link probe reported `BROKEN_LOCAL_LINK` findings.
  - demo step: open `README.md` -> `Engineering Documentation`, then open `docs/RUBRIC_QUALITY_MAP.md` and show command/artifact mapping for rubric 10%.
  - notes/screenshots: CI now uploads `docs-quality-report` artifact in `.github/workflows/ci.yml`.
- **Next bottleneck:** decide whether to promote docs-quality checks from informational mode to fail-hard mode after submission window closes.
