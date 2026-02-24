# AGENTS.md

## Mission
Build an **Arkiv-first Knowledge Base** that maximizes score on the Arkiv Builders Challenge rubric, with primary emphasis on **integration depth (40%)** and clear demoability.

## North-Star Constraints
1. Core domain data must live in Arkiv entities (no fallback SQL core).
2. Demonstrate updates, relationships, queries, and expiration intentionally.
3. Keep browsing usable without wallet; require wallet only for writes.
4. Every iteration should increase judged score, not just code volume.

## Working Mode (Iteration Loop)
For each iteration:
1. Pick one rubric-linked objective.
2. Implement smallest shippable increment.
3. Add/adjust tests and demo proof.
4. Record score impact in `EXPLANATIONS.md` and `ITERATION_LOG.md`.
5. Update `PLAN.md` progress.

## Definition of Done (Per Feature)
A feature is done only when all are true:
- Entity schema documented.
- Query path documented and tested.
- Expiration policy defined (or intentionally N/A).
- Ownership/read-vs-write behavior explicit.
- Demo step added to walkthrough notes.

## Prioritization Rules
When choosing between tasks:
1. Prefer Arkiv depth over UI breadth.
2. Prefer lifecycle completeness (update/extend/events) over net-new screens.
3. Prefer deterministic, judge-observable behavior over speculative features.
4. Prefer simplifying architecture over adding framework complexity.

## Required Artifacts
Maintain these files as living docs:
- `PLAN.md` → executable roadmap and status.
- `EXPLANATIONS.md` → why architecture decisions improve score.
- `ITERATION_LOG.md` → changelog + score delta hypothesis + evidence.
- `DEMO_SCRIPT.md` → short judge-oriented flow.

## Anti-Patterns to Avoid
- Treating Arkiv as a mirror while core data lives elsewhere.
- Creating new entities where `updateEntity`/`mutateEntities` is correct.
- Unbounded retention with no rationale.
- Search/filter implemented only client-side from cached data.
- Features that cannot be proven in a 3–5 minute demo.
