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
