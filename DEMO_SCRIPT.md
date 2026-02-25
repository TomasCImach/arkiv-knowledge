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
- Open one space and a page from `/spaces/[spaceSlug]/[pageSlug]`.
- Verbalize: “Read paths are public and query Arkiv directly.”

### 2) Wallet-Gated Write
- Connect wallet.
- Create a new space at `/new/space`.
- Create a page at `/spaces/[spaceSlug]/new`.
- Verbalize: “Wallet is required only for writes.”

### 3) Lifecycle Depth (Canonical + Revisions)
- Open page edit at `/spaces/[spaceSlug]/[pageSlug]/edit`.
- Edit and save twice.
- Show canonical page key stays constant while revision list grows.
- Verbalize: “Saves use mutate flow: canonical update + append-only revision.”

### 4) Relationships (Backlinks)
- In page body, add wiki-style link `[[another-page]]` and save.
- Open the linked page and show backlinks section populated.
- Verbalize: “Backlinks are persisted as `kb.link` entities and queried, not computed only in UI.”

### 5) Expiration + Presence
- On page detail, click `Join Presence`.
- Show live viewers list with TTL behavior.
- Use extension button on near-expiry entity (if visible) or explain trigger threshold.
- Verbalize: “Expiration and extension are intentional per entity class.”

### 6) Realtime Signal + Resilience
- Keep same page open in Tab A and Tab B.
- Edit in Tab A, show refresh in Tab B from event subscription.
- Mention fallback polling path if event stream degrades.

## Required Verbal Points
- “Core domain data is stored as Arkiv entities.”
- “Canonical pages are updated, revisions are append-only.”
- “Search and relationships are Arkiv-query-driven.”
- “Presence and expiration are product features, not incidental metadata.”

## Backup Paths (If Live Demo Fails)
- Run `pnpm restore:demo` to recover dataset.
- Show unit/integration/e2e evidence with `pnpm verify` output.
- Use deterministic seeded pages (`arkiv-demo/getting-started`, `arkiv-demo/presence-and-ttl`).
