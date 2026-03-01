# Plan V2 — Score Lift from Strong to Winner-Tier (2026-03-01)

## Target
Raise judged score from ~4.2/5 to >=4.6/5 by fixing data-integrity risks first, then tightening lifecycle semantics and submission-proof quality.

## Execution Status
- [x] Iteration 20 — Canonical Identity + Slug Integrity
- [x] Iteration 21 — Lifecycle Correctness Hardening
- [ ] Iteration 22 — Visibility Enforcement That Matches UI Claims
- [ ] Iteration 23 — Delete/Archive Lifecycle Completeness
- [ ] Iteration 24 — Judge-Optimized Submission Assets

## Current Weakness Summary
1. **Data integrity risk (highest impact):** canonical reads are slug-based and return first match, so duplicate slug collisions can produce non-deterministic results.
2. **Ownership integrity gap:** page queries are primarily `spaceSlug`-scoped, so third-party writes with copied slugs can pollute browse/search results.
3. **Lifecycle consistency bug:** page edits overwrite `createdAt` instead of preserving original creation timestamp. (resolved in Iteration 21)
4. **Visibility semantics gap:** `private`/`unlisted` states are writable but not consistently enforced in read paths.
5. **Submission packaging gap:** README quality is strong technically but still lacks judge-friendly assets/sections expected for top documentation score.

## Iteration Sequence

### Iteration 20 — Canonical Identity + Slug Integrity
- **Rubric objective:** Functionality (`data integrity`) + Arkiv integration (`entity relationships`, `ownership model`).
- **Smallest shippable increment:**
  - Resolve space first, then query pages by `spaceKey` (not only `spaceSlug`) on space/page routes.
  - Add create-time duplicate guardrails for `spaceSlug` and `(spaceKey,pageSlug)` per owner.
  - Make `getSpaceBySlug` / `getPageBySlug` deterministic with explicit ordering + tie-break strategy.
- **Tests/demo proof:**
  - Integration tests for duplicate slug conflict handling.
  - Integration tests proving cross-owner spoofed pages are excluded from canonical space reads.
  - Demo step: attempt duplicate page slug and show explicit conflict message.
- **Expected score delta:** high.

### Iteration 21 — Lifecycle Correctness Hardening
- **Rubric objective:** Arkiv integration (`advanced features`, `expiration strategy`) + Functionality (`data integrity`).
- **Smallest shippable increment:**
  - Preserve `payload.createdAt` on `editPage` updates; only mutate `updatedAt`.
  - Harden revision numbering to reduce race ambiguity (derive next from max revision number, not list length).
  - Add mutation failure compensation policy for `createPage` two-step flow (log + repair path).
- **Tests/demo proof:**
  - Integration test asserting `createdAt` stability across multiple edits.
  - Integration test for revision ordering under out-of-order writes.
  - Demo step: edit twice and show stable created timestamp + monotonic revision numbers.
- **Expected score delta:** medium-high.

### Iteration 22 — Visibility Enforcement That Matches UI Claims
- **Rubric objective:** Functionality (`core flows`) + UX (`blockchain abstraction`, `user experience`).
- **Smallest shippable increment:**
  - Enforce `public/unlisted/private` semantics in queries/routes.
  - Keep read-without-wallet for public data; allow owner bypass for private space reads.
  - Ensure global search excludes private content unless owner context is valid.
- **Tests/demo proof:**
  - E2E: disconnected user blocked from private space.
  - E2E: owner can read private space and manage settings.
  - Demo step: switch visibility and show resulting browse/search behavior.
- **Expected score delta:** medium.

### Iteration 23 — Delete/Archive Lifecycle Completeness
- **Rubric objective:** Arkiv integration (`entity relationships`, `advanced features`) + Functionality (`manage` flows, `data integrity`).
- **Smallest shippable increment:**
  - Add owner-only page archive/delete action.
  - On delete, clean relationship entities (`kb.link`, `kb.presence`) to avoid orphaned graph edges.
  - Define and document revision retention policy when canonical page is archived/deleted.
- **Tests/demo proof:**
  - Integration test for cascade cleanup of link/presence entities.
  - E2E test for owner delete/archived flow and post-delete navigation behavior.
  - Demo step: delete a page, show backlinks tree consistency.
- **Expected score delta:** medium-high.

### Iteration 24 — Judge-Optimized Submission Assets
- **Rubric objective:** Code quality/docs (10%) + judging speed/confidence.
- **Smallest shippable increment:**
  - Upgrade README with required submission sections: team members, deployed demo URL, architecture diagram, screenshots/GIF.
  - Add `pnpm verify:submission` to assert required submission fields/docs are present.
  - Extend evidence capture with short route clips (`home -> space -> page -> settings`) for quick judge review.
- **Tests/demo proof:**
  - CI job for `verify:submission`.
  - Evidence artifact index includes screenshots + clips + hash manifest.
  - Demo step: open evidence pack and show one-click judge trail.
- **Expected score delta:** medium.

## Execution Guardrails
- Keep Arkiv as the authoritative storage for all core domain data.
- Prefer canonical entity updates (`updateEntity` / `mutateEntities`) over introducing parallel entities.
- Every iteration must update: `PLAN.md`, `EXPLANATIONS.md`, `ITERATION_LOG.md`, `DEMO_SCRIPT.md`.
- Prioritize deterministic, judge-observable behavior over hidden complexity.

## Predicted Outcome If V2 Completes
- **Arkiv integration:** 4.4 -> 4.7
- **Functionality:** 4.1 -> 4.6
- **Design & UX:** 4.1 -> 4.3
- **Code quality/docs:** 4.1 -> 4.6
- **Weighted final:** ~4.6/5 (target band: 4.55-4.70)
