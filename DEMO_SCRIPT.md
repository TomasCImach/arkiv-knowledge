# DEMO_SCRIPT.md

## Target Duration
3–5 minutes.

## Demo Objective
Prove this is a usable knowledge base **and** deeply Arkiv-native.

## Pre-Demo Setup
1. Run `pnpm install`.
2. Run `pnpm verify`.
3. Ensure your demo key has Kaolin test ETH, then run `pnpm seed:demo` for deterministic data.
4. Run `pnpm evidence:capture` to pre-generate screenshot/report artifacts.
5. Optional strict proof check: `EVIDENCE_FAIL_SOFT=0 pnpm evidence:capture`.
6. Open two browser sessions (Tab A and Tab B).

## Judge-Oriented Walkthrough

### 1) Public Browse (No Wallet)
- Open `/` in Tab A with wallet disconnected.
- Use left navigation + breadcrumbs to move from home -> one space -> one page (`/spaces/[spaceSlug]/[pageSlug]`).
- Keep `Technical details` panels collapsed in default browse path, then expand one panel to show canonical key/retention transparency on demand.
- Verbalize: “Read paths are public, navigation hierarchy is optimized for documentation browsing, and the UI system intentionally separates reading typography from action/navigation typography.”

### 1.5) Mobile IA + Action Ergonomics
- Switch browser width to mobile.
- Open the `Menu` drawer, navigate to `Search Pages` or `My Spaces`, then close drawer.
- Open create/edit/search forms and scroll; show sticky mobile action bars for `Create`, `Save`, and `Apply query`.
- Verbalize: “Navigation remains explicit on mobile, and critical actions stay reachable while scrolling.”

### 2) Wallet-Gated Write
- Connect wallet.
- Create a new space at `/new/space`.
- Try creating the same space slug again and show duplicate guard message.
- Open `/spaces/[spaceSlug]/settings` and update description/visibility.
- In the same settings route, transfer space ownership to a second wallet address (or explain and show owner-only guard if single wallet demo).
- Verbalize: “Settings are readable by anyone, but only owner wallet can update.”
- Create a root page at `/spaces/[spaceSlug]/new`.
- Create a second page and set parent to the first page.
- Try creating a second page with the same slug in the same space and show conflict guard.
- Verbalize: “Wallet is required only for writes, and canonical authoring/transfer actions are owner-gated.”

### 2.5) Visibility Semantics (Private/Unlisted/Public)
- In space settings, switch visibility to `private`.
- Click `Verify Private Access` (wallet signature challenge, no transaction).
- Show anonymous/disconnected access to `/spaces/[spaceSlug]` returns not found.
- Re-open same route as the authenticated owner wallet and show route/settings are readable.
- Run `/search/pages` with filters and show private pages are excluded for non-owner wallet sessions.
- Verbalize: “Visibility is enforced in both route reads and cross-space queries.”

### 3) Lifecycle Depth (Canonical + Revisions)
- Open page edit at `/spaces/[spaceSlug]/[pageSlug]/edit`.
- In editor, switch between `Edit` and `Preview` tabs for markdown.
- Make a change and attempt to navigate away to show unsaved-change confirmation.
- Edit and save twice.
- After save, use inline CTA (`Open page` / `Back to space`) instead of auto-redirect.
- Show canonical page key stays constant while revision list grows.
- Confirm page `createdAt` stays stable while only `updatedAt` changes.
- On page detail, use **Archive Page** and show status transitions to `archived` with revision continuity.
- On another page, use **Delete Page** with slug confirmation and show redirect back to `/spaces/[spaceSlug]`.
- Mention delete cleanup policy: canonical page + links + presence + revisions are removed together.
- Verbalize: “Saves use mutate flow: canonical update + append-only revision, reads are anchored to canonical space key, and revision numbers are monotonic.”

### 4) Ownership Handoff
- On page detail route, use transfer form to transfer canonical page ownership.
- Refresh and show old owner is blocked from edit/transfer while new owner regains controls after wallet switch.
- Verbalize: “Ownership transfer uses Arkiv `changeOwnership` on canonical entities, not off-chain ACLs.”

### 5) Hierarchy + Query
- On space route, show nested page tree in sidebar (parent -> child).
- Open child page and show ancestor breadcrumb chain.
- In search UI, start with basic controls (`query`, `status`), then open advanced filters (`parent`, `owner`, `sort`) and apply.
- Remove one active filter using chip `x`, then show `Clear all`.
- Show result summary row (`Showing X pages in Y scope`) updates as filters change.
- Verbalize: “Hierarchy and filter logic are query-driven from Arkiv predicates, not client-only grouping.”

### 6) Global Discovery (Cross-Space Query)
- Open `/search/pages`.
- Search with at least two controls (example: `status=published`, `parent=root`, `sort=title_asc`, optional `owner=<0x...>`).
- Open one result and show route target works across spaces.
- Optional debug proof: in dev mode, show query debug panel with normalized predicate summary.
- Verbalize: “Cross-space discovery is Arkiv-query-first and remains fully public for read paths.”

### 7) Relationships (Backlinks)
- In page body, add wiki-style link `[[another-page]]` and save.
- Open the linked page and show backlinks section populated.
- Verbalize: “Backlinks are persisted as `kb.link` entities and queried, not computed only in UI.”

### 8) Expiration + Presence
- Open a page while wallet is connected and show presence activates automatically.
- Point out there is no wallet transaction popup for auto join/renew.
- Show live viewers list with TTL behavior.
- Use extension button on near-expiry entity (if visible) or explain trigger threshold.
- Optional debug proof: open browser console and show `[presence-heartbeat]` logs while renewals are delegated through `/api/presence`.
- Verbalize: “Presence lifecycle writes are server-signed and auto-managed while wallet is connected.”

### 9) Realtime Signal + Resilience
- Keep same page open in Tab A and Tab B.
- Edit in Tab A, show refresh in Tab B from event subscription.
- Mention fallback polling path if event stream degrades.

### 10) Evidence Pack (Submission Reliability)
- Open `output/playwright/evidence-pack/ARTIFACT_INDEX.md`.
- Show captured screenshots for home/space/page/settings/hierarchy/ownership-transfer/global-search.
- Show `report.json` entries for `walkthrough-clip` and realtime.
- Show `MANIFEST.sha256` hash list for artifact integrity.
- Verbalize: “Evidence capture is deterministic, hash-verifiable, and CI-uploaded in both fail-soft and strict modes.”

### 11) Recovery UX (Loading/Empty/Error)
- Navigate between routes and briefly show loading skeleton cards.
- Run a search that returns zero results and show task-oriented empty-state CTA.
- Show an Arkiv degraded-read state (if available) and click `Retry` to recover using in-place refresh.
- Verbalize: “Loading/empty/error surfaces are unified and actionable, so degraded reads do not break the flow.”

## Required Verbal Points
- “Core domain data is stored as Arkiv entities.”
- “Navigation and IA follow documentation UX conventions (sidebar hierarchy + breadcrumbs).”
- “Canonical pages are updated, revisions are append-only.”
- “Ownership transfer is explicit on canonical space/page entities.”
- “Search, filters, sorting, and relationships are Arkiv-query-driven.”
- “Presence and expiration are product features, not incidental metadata.”

## Backup Paths (If Live Demo Fails)
- Run `pnpm restore:demo` to recover dataset.
- Show unit/integration/e2e evidence with `pnpm verify` output.
- Show deterministic artifact pack from `pnpm evidence:capture`.
- Use deterministic seeded pages (`arkiv-demo/getting-started`, `arkiv-demo/presence-and-ttl`).
