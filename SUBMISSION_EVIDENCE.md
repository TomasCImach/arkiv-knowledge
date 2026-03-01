# SUBMISSION_EVIDENCE.md

## Purpose
Map each Arkiv Builders Challenge rubric area to concrete code paths, tests, and demo/evidence artifacts.

## Evidence Commands
```bash
pnpm verify
pnpm verify:submission
pnpm evidence:capture
EVIDENCE_FAIL_SOFT=0 pnpm evidence:capture
```

Artifacts are written to `output/playwright/evidence-pack/`.

## Rubric Mapping
| Rubric Area | Code Paths | Tests | Demo / Artifact Proof |
|---|---|---|---|
| Arkiv integration depth (40%) | `src/arkiv/schema/*`, `src/arkiv/queries/*`, `src/arkiv/mutations/*`, `src/arkiv/events/useArkivEvents.ts` | `tests/unit/schema-builders.test.ts`, `tests/integration/edit-page-mutate.test.ts`, `tests/integration/ownership-transfer.test.ts`, `tests/integration/search-predicates.test.ts`, `tests/integration/canonical-resolution.test.ts`, `tests/integration/create-page-repair.test.ts`, `tests/integration/delete-page-cleanup.test.ts` | Demo steps 3-10 in `DEMO_SCRIPT.md`; `output/playwright/evidence-pack/traces/*` |
| Functionality (30%) | `src/app/spaces/[spaceSlug]/settings/page.tsx`, `src/app/spaces/[spaceSlug]/new/page.tsx`, `src/app/spaces/[spaceSlug]/[pageSlug]/edit/page.tsx`, `src/app/spaces/[spaceSlug]/[pageSlug]/page.tsx`, `src/app/search/pages/page.tsx`, `src/arkiv/mutations/spaces.ts`, `src/arkiv/mutations/pages.ts` | `tests/e2e/edit-space-owner.test.tsx`, `tests/e2e/create-page-parent-selector.test.tsx`, `tests/e2e/transfer-ownership-form.test.tsx`, `tests/e2e/space-search-form-filters.test.tsx`, `tests/e2e/private-visibility-routes.test.tsx`, `tests/e2e/page-lifecycle-form.test.tsx`, `tests/integration/create-conflict-guards.test.ts`, `tests/integration/create-page-repair.test.ts`, `tests/integration/delete-page-cleanup.test.ts` | Demo steps 2-8; screenshots in `output/playwright/evidence-pack/screenshots/*` |
| UX / usability (20%) | `src/app/_components/app-shell.tsx`, `src/app/_components/breadcrumbs.tsx`, `src/app/_components/page-tree-nav.tsx`, `src/features/visibility/access.ts`, `src/app/globals.css` | `tests/e2e/no-wallet-browse.test.tsx`, `tests/e2e/create-page-owner-guard.test.tsx`, `tests/e2e/edit-page-owner-guard.test.tsx`, `tests/unit/visibility-access.test.ts`, `tests/e2e/private-visibility-routes.test.tsx` | Demo steps 1, 4, 6; screenshots `home.png`, `space.png`, `hierarchy.png` |
| Code quality / docs (10%) | `scripts/verify-phase.ts`, `scripts/verify-evidence.ts`, `scripts/verify-submission.ts`, `scripts/capture-evidence.ts`, `.github/workflows/ci.yml`, `.github/workflows/evidence-strict.yml` | `pnpm verify` end-to-end (lint/type/test/build/live skip-safe), `pnpm verify:submission` | `PLAN.md`, `EXPLANATIONS.md`, `ITERATION_LOG.md`, `DEMO_SCRIPT.md`, `README.md`, this file |

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
  - Captures a short walkthrough clip (`home -> space -> page -> settings`) when Playwright video export is available.
  - Attempts two-tab realtime mutation proof when `ARKIV_DEMO_PRIVATE_KEY` or `ARKIV_LIVE_TEST_PRIVATE_KEY` is available.
  - Writes pass/skip/fail status to `output/playwright/evidence-pack/report.json`.
  - Writes artifact hash manifest to `output/playwright/evidence-pack/MANIFEST.sha256`.
- CI policy:
  - Evidence capture step is fail-soft (`continue-on-error: true`).
  - Artifacts are uploaded when present.
  - Separate strict workflow runs fail-hard capture on schedule/manual dispatch.
