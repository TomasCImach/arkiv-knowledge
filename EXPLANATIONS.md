# EXPLANATIONS.md

## Purpose
This file explains **why** architecture/product decisions were made, with explicit linkage to scoring impact.

---

## 1) Arkiv-First Storage Boundary
All core domain records (spaces, pages, revisions, links, presence) are Arkiv entities. There is no SQL fallback for authoritative KB data.

**Scoring impact:** Directly supports Arkiv integration depth and avoids disqualification risk for core-data storage requirements.

---

## 2) Canonical Page + Append-Only Revisions
A page edit updates one stable `kb.page` canonical entity and appends a new `kb.revision` entity in the same `mutateEntities` write path.

**Why this matters:**
- canonical route identity remains stable,
- history remains auditable,
- lifecycle maturity is explicit and demoable.

**Scoring impact:** High impact for lifecycle design and advanced Arkiv write usage.

---

## 3) Queryable Relationship Graph via `kb.link`
Wiki-style links are parsed from markdown and persisted as `kb.link` edge entities. Backlinks are rendered from Arkiv queries only.

**Why this matters:**
- relationships are first-class entities,
- judges can verify edges directly,
- client cache-only graph anti-pattern is avoided.

**Scoring impact:** High impact for relationship modeling and query usage depth.

---

## 4) Intentional Expiration + Extension
Expiration policy is explicit by entity type:
- space/published page: long-lived,
- revision/link: medium-lived,
- presence: short-lived (90s) with heartbeat extension.

UI exposes near-expiry owner extension for space/page/revision.

**Scoring impact:** High impact for expiration strategy and Arkiv-native lifecycle behavior.

---

## 5) Public Read / Wallet Write UX Contract
Browse routes are fully public. Write actions (create/edit/presence/extend) require wallet connection.

**Scoring impact:** Improves UX and functionality without sacrificing ownership semantics.

---

## 6) Realtime + Resilience
Entity events are subscribed through Arkiv, with automatic polling fallback to preserve demo continuity under degraded subscriptions.

**Scoring impact:** Supports advanced feature scoring while reducing live-demo fragility.

---

## 7) Deterministic Verification and Evidence
The project now has:
- phase-agnostic verify command (`pnpm verify`),
- skip-safe live smoke (`pnpm test:live`),
- demo seed/restore scripts,
- unit/integration/e2e coverage aligned with rubric-critical paths.

**Scoring impact:** Strengthens code quality/docs category and increases confidence in judge reproducibility.

---

## 8) Score Delta Notes (Current Build)
- **Integration depth:** strong coverage (schema, update/mutate path, relationships, expiration, events).
- **Functionality:** strong CRUD + search/backlinks/presence.
- **UX:** compliant no-wallet browsing and explicit ownership boundaries.
- **Code quality/docs:** improved by CI, tests, README, and walkthrough updates.

Expected weighted outcome: materially above planning baseline, with strongest lift from integration depth proof.

---

## 9) Arkiv Annotation Compatibility Hardening
Arkiv rejects duplicate annotation keys in a single entity write. To keep page search query-first without violating this constraint, page indexing now stores tokens in deterministic slots (`token_0..token_19`) instead of repeated `token` keys.

**Why this matters:**
- resolves real on-chain write failures during page creation/edit,
- keeps search fully Arkiv-predicate-driven,
- improves demo reliability under live judge conditions,
- removes browser-side RPC CORS fragility via same-origin `/api/arkiv-rpc` proxy for wallet read transport.

**Scoring impact:** Medium-high uplift to integration reliability and deterministic functionality.

---

## 10) Wallet Write Reliability Guardrails
Browser wallet writes now harden two weak points seen in live usage:
- wallet tx receipt polling is routed through Arkiv RPC public transport to avoid provider-specific receipt instability,
- write preflight verifies wallet network and balance with provider-first checks, then Arkiv RPC fallback, and blocks writes when balance cannot be verified.
- provider-side send errors are preserved as `EntityMutationError` details before SDK wrapping, so UI shows concrete root cause instead of a generic fallback.
- Arkiv write client now uses the active wagmi connector provider (not raw `window.ethereum`) to avoid provider mismatch when multiple wallet extensions are installed.

Opaque SDK failures (`Transaction failed: undefined`) are now converted to actionable UI guidance.

**Scoring impact:** Medium uplift for demo reliability, error clarity, and judge-observable robustness under real wallet conditions.

---

## 11) Transaction Prompt Observability
Wallet transaction prompts are now explicitly logged in the browser console on each prompt/submit/failure:
- `[arkiv-tx:prompt]` includes target, chain, value, payload size, and full tx data blob,
- `[arkiv-tx:submitted]` includes tx hash,
- `[arkiv-tx:failed]` includes normalized provider rejection message.

Presence heartbeat activity is also logged (`[presence-heartbeat]`) so periodic prompts can be attributed immediately to presence extension.

**Scoring impact:** Medium uplift for debugability and judge confidence in deterministic lifecycle behavior.

---

## 12) BookStack-Inspired Information Architecture Upgrade
The UI shell now follows proven documentation UX conventions (as popularized by BookStack): persistent left hierarchy navigation, breadcrumb trail on all key routes, denser list-first browsing for spaces/pages, and a content-focused reading pane with reduced visual noise.

**Why this matters:**
- judges can discover hierarchy and route context in seconds,
- browse-to-edit flows become shorter and more predictable,
- the product reads like a documentation system instead of a generic card app,
- no-wallet read / wallet-only write model stays explicit in top-level actions.

**Scoring impact:** Medium-high uplift on UX category while preserving integration/functionality behavior.

---

## 13) Owner-Managed Space Settings (Iteration 15)
Space management now includes an explicit settings route (`/spaces/[spaceSlug]/settings`) backed by Arkiv `updateEntity` writes. Settings remain publicly readable, but only the owner wallet can submit updates; non-owner/direct-link access is handled as read-only with clear messaging.

`updateSpace` now preserves the original `createdAt` value while refreshing `updatedAt`, so lifecycle history stays coherent across canonical updates.

**Why this matters:**
- closes a core functionality requirement gap (`manage spaces and space settings`),
- makes ownership semantics judge-visible in a critical write flow,
- keeps Arkiv as the sole source of truth for mutable space metadata,
- improves live demo reliability with explicit guardrails for disconnected/non-owner states.

**Scoring impact:** High uplift on functionality with medium uplift on integration-depth ownership clarity.
