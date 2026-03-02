# Plan V3 - UX/Design Score Lift (2026-03-01)

## Target
Raise judged score from ~4.45/5 to >=4.65/5 by prioritizing Design & UX (20%) while preserving current Arkiv integration depth lead.

Challenge timing guardrail:
- Submission deadline is March 6, 2026 at 23:59 UTC.
- This plan is optimized for short, judge-visible UX increments before that date.

## Execution Status
- [x] Iteration 27 - Visual Identity + Readability System
- [x] Iteration 28 - Progressive Disclosure for Technical Metadata
- [x] Iteration 29 - Search UX Simplification
- [x] Iteration 30 - Authoring Experience Upgrade
- [x] Iteration 31 - Mobile-First Navigation + Action Ergonomics
- [x] Iteration 32 - Loading/Empty/Error States Unification

## Baseline (Rubric-Calibrated)
- Arkiv integration depth: strong (high-4s)
- Functionality: strong (mid/high-4s)
- Design & UX: main limiter (high-3s to low-4s)
- Code quality/docs: strong (mid/high-4s)

Primary score drag is not missing features. It is UX polish, visual distinctiveness, and flow clarity under real demo pressure.

## Current UX Weakness Summary
1. Visual language is consistent but generic: low-contrast blue/gray palette, limited hierarchy, weak brand memorability.
2. Too much technical detail in primary flows (canonical keys, TTL labels, Arkiv-first wording) before user intent is complete.
3. Search UI is powerful but cognitively heavy by default; advanced controls are always visible.
4. Authoring flow lacks quality-of-life UX (preview mode, unsaved-change guard, better edit feedback).
5. Mobile behavior is functional but not product-grade (sidebar collapse strategy and action density need stronger mobile IA).
6. Route-level loading/empty/retry states are uneven, which can look unstable during live judge demos.

## Iteration Sequence

### Iteration 27 - Visual Identity + Readability System
- Rubric objective: Design & UX (`visual design`, `user experience`).
- Smallest shippable increment:
  - Introduce stronger design tokens (contrast-safe semantic colors, spacing scale, elevation scale).
  - Apply body typography correctly (use serif/body for reading, sans for UI chrome) and tighten heading rhythm.
  - Add a distinct but restrained brand accent system for primary actions and active navigation.
- Tests/demo proof:
  - Add screenshot diffs for home/space/page/settings at desktop + mobile viewport.
  - Demo step: compare before/after screens in under 30 seconds.
- Expected score delta: medium-high.

### Iteration 28 - Progressive Disclosure for Technical Metadata
- Rubric objective: Design & UX (`blockchain abstraction`, `user experience`).
- Smallest shippable increment:
  - Move chain-heavy details (canonical keys, TTL internals, lifecycle mechanics) into collapsible "Technical details" panels.
  - Keep non-technical copy in primary UI path; retain full Arkiv transparency in optional panels.
  - Standardize owner-only messaging into concise action-oriented hints.
- Tests/demo proof:
  - Component tests verifying detail panel toggle behavior and owner/read-only messaging.
  - Demo step: browse and edit without exposing any blockchain jargon until details are expanded.
- Expected score delta: high.

### Iteration 29 - Search UX Simplification
- Rubric objective: Design & UX (`user experience`) + Functionality (`filtering & search`).
- Smallest shippable increment:
  - Split search into basic mode (query + status) and advanced filters (owner, parent mode, sort).
  - Add active-filter chips with one-click remove and "clear all."
  - Add query result summary row ("Showing X pages in Y scope").
- Tests/demo proof:
  - E2E for filter chips, clear-all, and URL serialization parity.
  - Demo step: run simple query first, then reveal advanced mode for judge-visible progressive disclosure.
- Expected score delta: medium-high.

### Iteration 30 - Authoring Experience Upgrade
- Rubric objective: Design & UX (`user experience`) + Functionality (`core flows work`).
- Smallest shippable increment:
  - Add markdown edit/preview tabs in create/edit forms.
  - Add unsaved-change protection on route leave.
  - Improve success/error feedback with inline callouts and post-write next-step CTA.
- Tests/demo proof:
  - Component tests for tab state + unsaved-change guard.
  - Demo step: edit page, preview markdown, attempt navigation with unsaved draft.
- Expected score delta: medium.

### Iteration 31 - Mobile-First Navigation + Action Ergonomics
- Rubric objective: Design & UX (`responsive`, `user experience`).
- Smallest shippable increment:
  - Convert desktop sidebar pattern into mobile drawer with explicit open/close control.
  - Add sticky mobile action bar on critical pages (new/edit/settings/search apply).
  - Enforce minimum touch target sizing and spacing for controls.
- Tests/demo proof:
  - Mobile viewport e2e snapshots for home, space, page, settings, search.
  - Demo step: complete browse + search + open page on mobile width without horizontal overflow.
- Expected score delta: high.

### Iteration 32 - Loading/Empty/Error States Unification
- Rubric objective: Design & UX (`user experience`) + Functionality (`error handling`).
- Smallest shippable increment:
  - Add route-level `loading.tsx` skeletons for home/space/page/search/settings.
  - Standardize empty states with task-oriented guidance and direct CTA.
  - Add retry affordances on degraded Arkiv reads instead of static warning text.
- Tests/demo proof:
  - Unit/e2e coverage for fallback and retry affordances.
  - Demo step: simulate degraded read and show recoverable UX path.
- Expected score delta: medium-high.

## Execution Guardrails
- Keep Arkiv as the only authoritative data source for core entities.
- Do not remove existing judge-evidence paths; expand them with UX screenshots and mobile captures.
- Prefer small, reversible CSS/component refactors over broad framework changes.
- Every iteration must update: `PLAN.md`, `EXPLANATIONS.md`, `ITERATION_LOG.md`, and `DEMO_SCRIPT.md`.

## Predicted Outcome If V3 Completes
- Arkiv integration: 4.7 -> 4.7
- Functionality: 4.5 -> 4.6
- Design & UX: 3.8 -> 4.5
- Code quality/docs: 4.6 -> 4.7
- Weighted final: ~4.65/5 (target band: 4.60-4.75)

V3 execution status on 2026-03-02: complete (iterations 27-32 shipped with test and demo evidence updates).
