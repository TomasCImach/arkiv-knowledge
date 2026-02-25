# Plan V1 — Rubric-Focused Uplift (2026-02-25)

## Target
Raise judged score from ~4.0/5 (~80/100) to >=4.4/5 by prioritizing high-weight rubric gaps with judge-visible proof.

## Current Gap Summary
1. **Functionality gap (highest impact):** no shipped space settings management UI despite mutation support.
2. **Functionality + UX gap:** `parentPageKey` exists in schema but hierarchy create/edit/query UX is not implemented.
3. **Integration depth gap:** ownership model is partially demonstrated (write-gated, extend owner-check) but lacks owner-aware action gating and ownership transfer flow.
4. **Evidence gap:** limited deterministic proof for multi-session realtime and wallet-connected write success in automation artifacts.

## Iteration Sequence

### Iteration 15 — Space Settings (Owner-Managed)
- **Rubric objective:** Functionality minimums (`manage spaces and space settings`) + ownership clarity.
- **Smallest shippable increment:**
  - Add `/spaces/[spaceSlug]/settings` route.
  - Add owner-only `EditSpaceForm` using existing `updateSpace` mutation.
  - Expose editable fields: name, description, visibility, status.
  - Hide/disable settings action for non-owners with explicit message.
- **Tests/demo proof:**
  - Integration test for successful `updateEntity` settings mutation.
  - E2E test: owner can edit; non-owner sees blocked action.
  - Demo step: update description/visibility and refresh read view.
- **Expected score delta:** high.

### Iteration 16 — True Page Hierarchy
- **Rubric objective:** Functionality minimums (`page hierarchies`) + better knowledge-base IA.
- **Smallest shippable increment:**
  - Add parent selector when creating/editing pages.
  - Persist `parentPageKey` in both create/edit flows.
  - Render nested tree (parent -> children) in space/page sidebars.
  - Add optional parent filter in space query UI.
- **Tests/demo proof:**
  - Unit test for tree builder from flat page list.
  - Integration test for `parentPageKey` write/read path.
  - Demo step: create parent + child, show nested navigation and breadcrumb depth.
- **Expected score delta:** high.

### Iteration 17 — Ownership Depth + Transfer
- **Rubric objective:** Arkiv integration depth (ownership model + advanced features).
- **Smallest shippable increment:**
  - Expand write client type and wrappers to support `changeOwnership` / `mutateEntities.ownershipChanges`.
  - Add owner-only transfer action for `kb.space` and canonical `kb.page`.
  - Add “Owned by me” filter chips using Arkiv `ownedBy(...)` query path.
  - Make edit/create controls owner-aware with explicit reason text when blocked.
- **Tests/demo proof:**
  - Integration tests for ownership transfer mutation payload and post-transfer permissions.
  - E2E test for owner -> new owner handoff flow.
  - Demo step: transfer page ownership and show new owner can extend/edit.
- **Expected score delta:** high.

### Iteration 18 — Query/Discovery Depth
- **Rubric objective:** Integration depth (query usage sophistication) + UX findability.
- **Smallest shippable increment:**
  - Add sort controls (`updated desc/asc`, `title asc`).
  - Add combined filters (status + owner + parent/root).
  - Add top-level cross-space search route using Arkiv predicates (no client-side cache filtering).
  - Add query-debug panel (dev mode) showing active predicate summary.
- **Tests/demo proof:**
  - Predicate-builder tests for all filter/sort combinations.
  - E2E coverage for filter/sort state in URL and deterministic results.
  - Demo step: live switch filters and show server query-driven changes.
- **Expected score delta:** medium-high.

### Iteration 19 — Judge Evidence Pack
- **Rubric objective:** Code quality/docs + demo reliability.
- **Smallest shippable increment:**
  - Add Playwright two-tab realtime scenario (edit in tab A, observe tab B refresh).
  - Add deterministic screenshot capture script for home/space/page/settings/hierarchy/ownership-transfer states.
  - Add `SUBMISSION_EVIDENCE.md` mapping every rubric item to code path + test + demo step.
- **Tests/demo proof:**
  - Playwright artifact upload in CI.
  - Docs checks integrated into `pnpm verify`.
  - Demo step: show artifact folder + quick verification commands.
- **Expected score delta:** medium.

## Execution Guardrails
- Keep Arkiv as authoritative core storage for all new behaviors.
- Prefer `updateEntity`/`mutateEntities` over new entities when lifecycle semantics are updates.
- Every iteration must update `PLAN.md`, `EXPLANATIONS.md`, `ITERATION_LOG.md`, and `DEMO_SCRIPT.md` with objective, evidence, and score-delta hypothesis.
- Optimize for judge-observable outcomes in <5 minutes, not hidden backend complexity.

## Proposed Next Move
Start with **Iteration 15 (Space Settings)** because it closes a direct minimum-requirement risk and can be shipped quickly with clear demo proof.
