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

---

## 14) True Page Hierarchy (Iteration 16)
Hierarchy features now fully operational around the existing `parentPageKey` schema:
- create/edit flows can set or change parent pages,
- reparenting blocks self/descendant cycles before mutation,
- side navigation renders nested tree structure with deterministic ordering (`updatedAtMs desc`, tie-breakers by title/slug),
- page breadcrumbs include full ancestor path,
- space search supports hierarchy-aware filtering (`all`, `root`, `child`) through Arkiv predicates.

**Why this matters:**
- closes a functionality gap (`page hierarchies`) with judge-observable behavior,
- strengthens Arkiv query depth by adding parent-aware predicate modes,
- improves information scent in documentation navigation without adding non-Arkiv persistence,
- keeps hierarchy lifecycle canonical by updating existing `kb.page` entities rather than creating parallel structures.

**Scoring impact:** High uplift on functionality, with medium-high uplift on integration-depth query and relationship modeling.

---

## 15) Query + Discovery Depth (Iteration 18)
Query and browse paths now expose richer Arkiv-driven discovery controls without introducing non-Arkiv storage:
- sort modes are first-class query inputs (`updated_desc`, `updated_asc`, `title_asc`),
- owner filter is supported in both space-scoped and global page search,
- global cross-space page search route (`/search/pages`) uses Arkiv predicates directly,
- dev-only query debug panel shows normalized predicate intent for judge/debug transparency.

**Why this matters:**
- closes a functionality gap (`advanced querying/filtering`) with deterministic, UI-visible behavior,
- increases Arkiv integration depth by expanding reusable query builder contracts beyond one route,
- keeps read paths public while preserving wallet-gated write boundary,
- improves demo clarity by making query behavior explicit and inspectable during walkthroughs.

**Scoring impact:** Medium-high uplift on functionality and medium uplift on integration-depth/query sophistication.

---

## 16) Ownership Transfer + Owner-Aware Authoring (Iteration 17)
Ownership semantics are now explicit across canonical entities and authoring surfaces:
- transfer wrappers now use Arkiv `changeOwnership` for canonical `kb.space` and `kb.page`,
- owner-only transfer actions are visible on space settings and page detail routes,
- create/edit page forms enforce owner checks with clear non-owner and disconnected-wallet messaging,
- search UI exposes `Owned by me` chips to drive Arkiv `ownedBy(...)` predicate paths without manual address typing.

**Why this matters:**
- closes an integration-depth gap around ownership lifecycle beyond simple write gating,
- makes handoff behavior judge-visible (`owner A -> owner B`) on real canonical entities,
- improves UX clarity by surfacing permission reasons before submit attempts,
- preserves Arkiv-first architecture by handling ownership changes through native wallet mutations.

**Scoring impact:** High uplift on integration depth and medium-high uplift on functionality/permission clarity.

---

## 17) Judge Evidence Pack + Fail-Soft Capture (Iteration 19)
Iteration 19 shifts from pure feature work to reproducible proof quality:
- deterministic evidence capture script now records route screenshots for required judging states (`home`, `space`, `page`, `settings`, `hierarchy`, `ownership-transfer`, `global-search`),
- two-tab realtime artifact path is automated when demo key is available and clearly reported as `skipped` when unavailable,
- CI now runs evidence capture in fail-soft mode and uploads artifacts without blocking merge on environment limitations,
- `SUBMISSION_EVIDENCE.md` maps rubric categories to concrete code paths, tests, and demo steps.

**Why this matters:**
- increases judge confidence by turning claims into repeatable artifacts,
- avoids brittle CI behavior while still collecting high-value proof when credentials are present,
- shortens judging time by centralizing rubric traceability in one document,
- keeps engineering rigor: evidence-doc existence is now validated in `pnpm verify`.

**Scoring impact:** Medium-high uplift on code quality/docs and medium uplift on demo reliability.

---

## 18) Canonical Identity + Slug Integrity (Iteration 20)
Iteration 20 focuses on integrity under adversarial or accidental slug collisions:
- canonical `getSpaceBySlug` and `getPageBySlug` now use deterministic selection (ordered query + explicit tie-break),
- space/page route reads now resolve canonical space first and query pages by `spaceKey` (not slug-only),
- write paths now block duplicate `spaceSlug` and duplicate `(spaceKey,pageSlug)` before wallet mutation,
- link-target resolution inside page mutations now resolves by canonical `spaceKey` scope to avoid cross-space slug bleed.

**Why this matters:**
- removes non-deterministic route behavior when duplicate slugs exist,
- reduces spoof/pollution risk from third-party entities reusing the same slug strings,
- improves judge confidence in data integrity and canonical navigation semantics,
- keeps architecture Arkiv-first while tightening identity guarantees at query/mutation boundaries.

**Scoring impact:** High uplift on functionality (`data integrity`) with medium-high uplift on integration-depth ownership/relationship rigor.

---

## 19) Lifecycle Correctness Hardening (Iteration 21)
Iteration 21 closes lifecycle integrity gaps in canonical page mutations:
- `editPage` now preserves canonical `payload.createdAt` and updates only `updatedAt`,
- revision numbering now derives from `max(revisionNo)+1` instead of total count,
- create-page two-step writes (`createEntity` -> follow-up `mutateEntities`) now have an explicit compensation path:
  - log failure context,
  - attempt to repair missing initial revision,
  - attempt best-effort link re-creation,
  - return recovered tx when revision integrity is restored,
  - otherwise throw actionable operator guidance.

**Why this matters:**
- prevents lifecycle metadata drift on every edit,
- avoids revision number collisions in sparse histories,
- reduces orphaned canonical pages when follow-up mutations fail mid-flow,
- makes recovery behavior deterministic and judge-observable rather than silent.

**Scoring impact:** Medium-high uplift on functionality (`data integrity`) and medium uplift on integration-depth lifecycle maturity.

---

## 20) Visibility Semantics Enforcement (Iteration 22)
Iteration 22 aligns runtime behavior with declared visibility model:
- `private` routes now require owner context and return `notFound()` otherwise,
- public browse/navigation surfaces list only `public` spaces (unlisted/private removed from broad discovery),
- direct reads for `unlisted` continue to work by URL,
- cross-space search filters pages against visible spaces so private content is excluded for non-owner viewers.

**Why this matters:**
- removes mismatch between writable visibility fields and read-path behavior,
- makes permission boundaries judge-visible in both route and query flows,
- protects global discovery from unintentionally leaking private entities.

**Scoring impact:** Medium-high uplift on functionality/UX trust and medium uplift on integration-depth query correctness.

---

## 21) Strict Evidence Capture Reliability (Iteration 22)
Realtime evidence capture now has explicit reliability controls:
- command timeout guard for Playwright CLI steps to avoid indefinite hangs,
- deterministic write confirmation against Arkiv read path before browser observation verdict,
- tab-targeting plus browser diagnostic fallback,
- strict CI workflow (`.github/workflows/evidence-strict.yml`) that runs fail-hard capture with required funded key.

**Why this matters:**
- converts previous strict realtime timeout failure into reproducible artifact generation,
- keeps evidence truthful by recording whether direct two-tab observation succeeded vs fallback path,
- increases judge confidence that submission claims are backed by repeatable automation.

**Scoring impact:** Medium uplift on code quality/docs and medium uplift on demo reliability.

---

## 22) Archive/Delete Lifecycle Completeness (Iteration 23)
Iteration 23 closes the remaining page-management lifecycle gap with explicit owner actions:
- page detail now exposes owner-only archive and hard-delete controls,
- archive flow updates canonical status to `archived` and appends revision history,
- hard-delete flow removes canonical page plus related `kb.link`, `kb.presence`, and `kb.revision` entities via one cleanup mutation,
- deletion requires slug confirmation in UI to reduce accidental destructive writes.

**Why this matters:**
- completes lifecycle management expectations beyond create/edit only,
- avoids orphaned relationship and presence entities after destructive actions,
- preserves clear read/write boundaries with explicit owner gating on destructive operations,
- keeps lifecycle behavior judge-observable directly from canonical page route.

**Scoring impact:** Medium-high uplift on functionality (`manage/delete flows`) and medium uplift on integration-depth lifecycle rigor.

---

## 23) Submission Verification + Asset Packaging (Iteration 24)
Iteration 24 focuses on judge speed and reproducibility confidence:
- README now includes explicit submission sections (team members, demo URL placeholder, architecture diagram, judge screenshots),
- committed screenshot assets live under `public/submission/`,
- new `verify:submission` script enforces required docs/sections/assets and capture capabilities,
- `pnpm verify` and CI now execute submission verification consistently.

Evidence packaging also improved:
- evidence capture now emits a walkthrough clip artifact (`video` when available, otherwise deterministic trace fallback),
- bundle hash manifest (`MANIFEST.sha256`) is generated for artifact integrity checks.

**Why this matters:**
- reduces judging friction by surfacing key submission facts and visuals immediately,
- prevents documentation regressions through automated gates,
- increases confidence that evidence artifacts are reproducible and untampered.

**Scoring impact:** Medium uplift on code quality/docs and medium uplift on demo reliability.

---

## 24) Private Owner Context Continuity (Iteration 25)
Iteration 25 closed a high-friction visibility flow gap: owners could create or privatize a space and immediately hit `notFound()` because private-route owner context was not consistently preserved.

Implemented continuity fixes:
- private create/update paths now ensure owner context is established before navigating into private routes,
- regression tests now enforce both flows.

**Why this matters:**
- removes an immediately judge-visible failure mode in private-space lifecycle demos,
- improves integration depth perception by showing private visibility as a coherent end-to-end Arkiv behavior (write + read path continuity),
- keeps no-wallet browse semantics intact while avoiding owner self-lockout.

**Scoring impact:** Medium uplift on functionality reliability and medium uplift on integration-depth demoability.

---

## 25) Wallet-Authenticated Private Reads (Iteration 26)
Iteration 26 replaces insecure URL-based owner context with cryptographic wallet verification:
- added wallet auth challenge endpoints (`nonce`, `verify`, `session`, `logout`),
- private-route checks now read authenticated viewer identity from signed HttpOnly session cookie,
- create/update flows for private spaces explicitly verify session before redirecting,
- header now exposes a clear `Verify Private Access` action for deterministic demo control.

**Why this matters:**
- removes spoofable `?viewer=` authorization surface entirely,
- ties private read access to a wallet signature from the connected account,
- improves judge confidence in ownership/visibility integrity while preserving public browse behavior.

**Scoring impact:** High uplift on integration depth security posture and medium-high uplift on private-flow reliability.

---

## 26) Visual Identity + Readability System (Iteration 27)
Iteration 27 focuses on Design & UX lift without changing Arkiv storage/query behavior:
- refreshed the global token system with clearer semantic contrast (ink/surface/line/accent), spacing, radius, and elevation scales,
- introduced stronger but restrained brand expression through accent usage, surface treatment, and interaction feedback,
- corrected typography boundary so long-form reading uses body serif while UI chrome/headings/actions use heading font,
- improved hover/focus states and card/list affordances to make navigation and action priority more legible in demos.

**Why this matters:**
- directly targets the rubric's visual design axis (distinctive identity + cohesive style),
- increases readability and perceived product maturity on first visit,
- improves judge scanning speed for primary CTAs and information hierarchy,
- preserves Arkiv-first proof quality by keeping all data and lifecycle semantics unchanged.

**Scoring impact:** Medium-high uplift on Design & UX with low implementation risk.

---

## 27) Progressive Disclosure for Technical Metadata (Iteration 28)
Iteration 28 reduces cognitive load in primary UX while preserving integration transparency:
- introduced reusable `Technical details` disclosure panels for optional advanced context,
- moved canonical keys, retention controls, and lifecycle internals out of the main action path on space/page/settings/presence surfaces,
- simplified blockchain-heavy copy into plain task guidance for default reads and writes,
- standardized owner gating hints to action-oriented text (`connect owner wallet`, `switch to owner wallet`).

**Why this matters:**
- improves blockchain abstraction score by keeping web3 complexity behind optional disclosure,
- strengthens first-visit usability and scan speed during the 3–5 minute judge walkthrough,
- keeps technical rigor available for judges who want to inspect Arkiv specifics,
- avoids integration regressions by changing presentation only, not data paths.

**Scoring impact:** High uplift on UX abstraction/clarity with low implementation risk.
