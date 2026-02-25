# SUBMISSION_EVIDENCE.md

## Purpose
Map each Arkiv Builders Challenge rubric area to concrete code paths, tests, and demo/evidence artifacts.

## Evidence Commands
```bash
pnpm verify
pnpm evidence:capture
```

Artifacts are written to `output/playwright/evidence-pack/`.

## Rubric Mapping
| Rubric Area | Code Paths | Tests | Demo / Artifact Proof |
|---|---|---|---|
| Arkiv integration depth (40%) | `src/arkiv/schema/*`, `src/arkiv/queries/*`, `src/arkiv/mutations/*`, `src/arkiv/events/useArkivEvents.ts` | `tests/unit/schema-builders.test.ts`, `tests/integration/edit-page-mutate.test.ts`, `tests/integration/ownership-transfer.test.ts`, `tests/integration/search-predicates.test.ts` | Demo steps 3-9 in `DEMO_SCRIPT.md`; `output/playwright/evidence-pack/traces/*` |
| Functionality (30%) | `src/app/spaces/[spaceSlug]/settings/page.tsx`, `src/app/spaces/[spaceSlug]/new/page.tsx`, `src/app/spaces/[spaceSlug]/[pageSlug]/edit/page.tsx`, `src/app/search/pages/page.tsx` | `tests/e2e/edit-space-owner.test.tsx`, `tests/e2e/create-page-parent-selector.test.tsx`, `tests/e2e/transfer-ownership-form.test.tsx`, `tests/e2e/space-search-form-filters.test.tsx` | Demo steps 2-7; screenshots in `output/playwright/evidence-pack/screenshots/*` |
| UX / usability (20%) | `src/app/_components/app-shell.tsx`, `src/app/_components/breadcrumbs.tsx`, `src/app/_components/page-tree-nav.tsx`, `src/app/globals.css` | `tests/e2e/no-wallet-browse.test.tsx`, `tests/e2e/create-page-owner-guard.test.tsx`, `tests/e2e/edit-page-owner-guard.test.tsx` | Demo steps 1, 4, 6; screenshots `home.png`, `space.png`, `hierarchy.png` |
| Code quality / docs (10%) | `scripts/verify-phase.ts`, `scripts/verify-evidence.ts`, `scripts/capture-evidence.ts`, `.github/workflows/ci.yml` | `pnpm verify` end-to-end (lint/type/test/build/live skip-safe) | `PLAN.md`, `EXPLANATIONS.md`, `ITERATION_LOG.md`, `DEMO_SCRIPT.md`, this file |

## Ownership-Specific Evidence
- Transfer flow code:
  - `src/app/_components/transfer-ownership-form.tsx`
  - `src/arkiv/mutations/ownership.ts`
- Owner gating code:
  - `src/app/_components/create-page-form.tsx`
  - `src/app/_components/edit-page-form.tsx`
  - `src/app/_components/edit-space-form.tsx`
- Tests:
  - `tests/integration/ownership-transfer.test.ts`
  - `tests/e2e/transfer-ownership-form.test.tsx`
  - `tests/e2e/create-page-owner-guard.test.tsx`
  - `tests/e2e/edit-page-owner-guard.test.tsx`

## Realtime Evidence Policy
- Script: `scripts/capture-evidence.ts`
- Behavior:
  - Captures deterministic route screenshots.
  - Attempts two-tab realtime mutation proof when `ARKIV_DEMO_PRIVATE_KEY` or `ARKIV_LIVE_TEST_PRIVATE_KEY` is available.
  - Writes pass/skip/fail status to `output/playwright/evidence-pack/report.json`.
- CI policy:
  - Evidence capture step is fail-soft (`continue-on-error: true`).
  - Artifacts are uploaded when present.
