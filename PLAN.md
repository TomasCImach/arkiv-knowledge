# PLAN.md

## Goal
Ship a high-scoring Arkiv-first Knowledge Base submission with clear evidence across all rubric categories, prioritizing Arkiv integration depth.

## Rubric-Weighted Execution Strategy
- **40% Arkiv Integration**: schema quality, query usage, ownership model, relationships, expiration strategy, advanced features.
- **30% Functionality**: spaces/pages CRUD, revisioning, search/filtering, reliable browse/edit flows.
- **20% UX**: no-wallet browse, clear IA, understandable ownership/expiry states.
- **10% Code Quality/Docs**: readable modules, tests, setup docs, demo script.

## Phase Plan

### Phase 0 — Foundation (Day 0–1)
- [ ] Initialize app shell + Arkiv client split (public read / wallet write).
- [ ] Add minimal smoke tests for read/write.
- [ ] Baseline docs and architecture diagram.

**Exit criteria:** one entity can be created and read back publicly.

### Phase 1 — Core Domain Model (Day 1–3)
- [ ] Implement entity builders for:
  - `kb.space`
  - `kb.page`
  - `kb.revision`
  - `kb.link`
  - `kb.presence`
- [ ] Add schema validation/unit tests.
- [ ] Define default expiration matrix per entity type.

**Exit criteria:** deterministic schema and tested builders.

### Phase 2 — Spaces + Pages MVP (Day 3–5)
- [ ] Public space listing and space landing.
- [ ] Page create/edit/read paths.
- [ ] Save flow uses update + revision create (ideally via `mutateEntities`).

**Exit criteria:** canonical page stays stable while revisions accumulate.

### Phase 3 — Relationships + Query-First Navigation (Day 5–7)
- [ ] Parent/child page hierarchy.
- [ ] Link extraction and `kb.link` edge writes.
- [ ] Backlinks page powered purely by Arkiv query results.

**Exit criteria:** at least one relationship-derived UI (e.g., backlinks).

### Phase 4 — Expiration + Presence (Day 7–9)
- [ ] Presence entities with short TTL + extension.
- [ ] Owned content extension UX for near-expiry pages/spaces.
- [ ] Expiration behavior visible in UI.

**Exit criteria:** demonstrable create → extend/expire lifecycle.

### Phase 5 — Real-Time + Polish (Day 9–11)
- [ ] Subscribe to Arkiv entity events.
- [ ] Reflect live edits/presence updates in UI.
- [ ] Improve no-wallet browse flow and clarity messaging.

**Exit criteria:** two-tab realtime demo works reliably.

### Phase 6 — Submission Hardening (Day 11–13)
- [ ] README with architecture, schema table, and 3+ example queries.
- [ ] Demo script and fallback/error handling.
- [ ] Fresh machine setup verification.

**Exit criteria:** judge can run and evaluate quickly.

## Task Selection Heuristic (Daily)
1. Which open task most improves Arkiv integration score?
2. Can we prove it in a short demo?
3. Do tests/docs keep pace with implementation?

Pick the smallest task that answers “yes” to all three.

## Risks and Mitigations
- **Risk:** Overbuilding UI before deep Arkiv mechanics.  
  **Mitigation:** Do not open new UX epics until lifecycle + relationships are implemented.
- **Risk:** Fragile real-time behavior near deadline.  
  **Mitigation:** Keep polling fallback and explicit state refresh paths.
- **Risk:** Unclear judging narrative.  
  **Mitigation:** Tie every merged feature to one rubric bullet in docs.
