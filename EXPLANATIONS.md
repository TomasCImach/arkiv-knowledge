# EXPLANATIONS.md

## Purpose
This file explains **why** we are making architecture/product decisions, with explicit linkage to scoring impact.

---

## 1) Why Arkiv-First, Not Framework-First
A winning submission is primarily judged on integration depth. Therefore, core entities, relationships, and lifecycle behavior must be first-class in the design.

**Scoring impact:** Directly strengthens integration depth across schema, query usage, ownership, relationships, and expiration.

---

## 2) Why Canonical Page + Revision Entities
We keep one stable `kb.page` as canonical state and append `kb.revision` on edits. Saves should favor update operations over generating a new canonical entity each edit.

**Why this matters:**
- preserves stable URLs/query targets,
- keeps history auditable,
- demonstrates mature entity lifecycle handling.

**Scoring impact:** Higher confidence in lifecycle design and data modeling quality.

---

## 3) Why Relationship Entities (`kb.link`) Instead of Derived-Only Client State
Backlinks and graph views should be queryable data, not only ephemeral UI computations.

**Why this matters:**
- explicit inter-entity structure,
- easier judge verification,
- supports future graph features without schema rewrite.

**Scoring impact:** Improves relationship-depth and query usage categories.

---

## 4) Why Presence + Expiration Is a Signature Feature
`kb.presence` entities with short TTL and active extension show Arkiv-native temporal behavior (similar to ephemeral coordination patterns).

**Why this matters:**
- demonstrates intentional expiration strategy,
- creates a visible live feature judges can quickly understand,
- differentiates from generic CRUD demos.

**Scoring impact:** Boosts expiration strategy and advanced features.

---

## 5) Why Public Read + Wallet Write Boundary
No-wallet browsing lowers friction and aligns with “documentation product” expectations, while wallet-gated writes enforce ownership semantics.

**Scoring impact:** Improves functionality + UX while preserving integration integrity.

---

## 6) Why Query-First Search/Filtering
Search/filter behavior should be represented as Arkiv query predicates, not only post-query client filtering.

**Why this matters:**
- makes data access strategy inspectable,
- proves query capability use in real UX flows.

**Scoring impact:** Directly supports query usage rubric components.

---

## 7) Score Delta Template (Use per Iteration)
For every merged change, append a short note in `ITERATION_LOG.md`:
- **Change:** what shipped.
- **Rubric target:** which scoring bullets it advances.
- **Expected delta:** low/medium/high.
- **Evidence:** tests, screenshots, demo step.
