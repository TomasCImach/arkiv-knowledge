# DEMO_SCRIPT.md

## Target Duration
3–5 minutes.

## Demo Objective
Prove this is a usable knowledge base **and** deeply Arkiv-native.

## Pre-Demo Setup
1. Run `pnpm install`.
2. Run `pnpm verify`.
3. Ensure your demo key has Kaolin test ETH, then run `pnpm seed:demo` for deterministic data.
4. Open two browser sessions (Tab A and Tab B).

## Judge-Oriented Walkthrough

### 1) Public Browse (No Wallet)
- Open `/` in Tab A with wallet disconnected.
- Use left navigation + breadcrumbs to move from home -> one space -> one page (`/spaces/[spaceSlug]/[pageSlug]`).
- Verbalize: “Read paths are public, and navigation hierarchy is optimized for documentation browsing.”

### 2) Wallet-Gated Write
- Connect wallet.
- Create a new space at `/new/space`.
- Open `/spaces/[spaceSlug]/settings` and update description/visibility.
- Verbalize: “Settings are readable by anyone, but only owner wallet can update.”
- Create a root page at `/spaces/[spaceSlug]/new`.
- Create a second page and set parent to the first page.
- Verbalize: “Wallet is required only for writes.”

### 3) Lifecycle Depth (Canonical + Revisions)
- Open page edit at `/spaces/[spaceSlug]/[pageSlug]/edit`.
- Edit and save twice.
- Show canonical page key stays constant while revision list grows.
- Verbalize: “Saves use mutate flow: canonical update + append-only revision.”

### 4) Hierarchy + Query
- On space route, show nested page tree in sidebar (parent -> child).
- Open child page and show ancestor breadcrumb chain.
- Apply search filters (`parent`, `owner`, `sort`) and show Arkiv-query-backed result changes.
- Verbalize: “Hierarchy and filter logic are query-driven from Arkiv predicates, not client-only grouping.”

### 5) Global Discovery (Cross-Space Query)
- Open `/search/pages`.
- Search with at least two controls (example: `status=published`, `parent=root`, `sort=title_asc`, optional `owner=<0x...>`).
- Open one result and show route target works across spaces.
- Optional debug proof: in dev mode, show query debug panel with normalized predicate summary.
- Verbalize: “Cross-space discovery is Arkiv-query-first and remains fully public for read paths.”

### 6) Relationships (Backlinks)
- In page body, add wiki-style link `[[another-page]]` and save.
- Open the linked page and show backlinks section populated.
- Verbalize: “Backlinks are persisted as `kb.link` entities and queried, not computed only in UI.”

### 7) Expiration + Presence
- On page detail, click `Join Presence`.
- Show live viewers list with TTL behavior.
- Use extension button on near-expiry entity (if visible) or explain trigger threshold.
- Optional debug proof: open browser console and show `[presence-heartbeat]` + `[arkiv-tx:*]` logs for each periodic extension prompt.
- Verbalize: “Expiration and extension are intentional per entity class.”

### 8) Realtime Signal + Resilience
- Keep same page open in Tab A and Tab B.
- Edit in Tab A, show refresh in Tab B from event subscription.
- Mention fallback polling path if event stream degrades.

## Required Verbal Points
- “Core domain data is stored as Arkiv entities.”
- “Navigation and IA follow documentation UX conventions (sidebar hierarchy + breadcrumbs).”
- “Canonical pages are updated, revisions are append-only.”
- “Search, filters, sorting, and relationships are Arkiv-query-driven.”
- “Presence and expiration are product features, not incidental metadata.”

## Backup Paths (If Live Demo Fails)
- Run `pnpm restore:demo` to recover dataset.
- Show unit/integration/e2e evidence with `pnpm verify` output.
- Use deterministic seeded pages (`arkiv-demo/getting-started`, `arkiv-demo/presence-and-ttl`).
