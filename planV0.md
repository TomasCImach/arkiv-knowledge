# Winning the Arkiv Web3 Database Builders Challenge with a Knowledge Base Track Submission

## Challenge north star and what “winning” really means

The Arkiv Web3 Database Builders Challenge is explicitly asking you to replace a “centralized everyday tool” (docs, events, job board) with something **Web3-native** where “the data is owned by users, not platforms,” and to ship a **working product** within a two‑week build window. citeturn31view0turn2view0

Within the **Knowledge Base** vertical, the organizers are signaling two things at once:

- They want a tool that *feels like a real documentation product* (spaces/projects + pages, browseable publicly, reasonable UX). citeturn2view0turn31view0  
- They want you to demonstrate that Arkiv isn’t “just another database,” but a data primitive with **entities**, **queryable attributes**, and **time-scoped expiration** that you use intentionally—not as an afterthought. citeturn7view0turn2view0

The scoring rubric backs this up: the largest portion of the score is Arkiv integration depth, and the rubric explicitly breaks that down into subcomponents like entity schema, query usage, ownership model, relationships, expiration strategy, and advanced features. citeturn2view1

Strategically, that means the “winning” move is **not** to ship the biggest feature set. It is to ship a knowledge base that:

- Stores core domain data *as Arkiv entities*, not in a traditional DB. citeturn2view0  
- Uses **updates** and **expiration extensions** (not just a stream of new entities) to show mature lifecycle handling—exactly aligned with your kickstart call tips. citeturn15view0turn15view3turn2view0  
- Builds **inter-related structures** (space ⇄ page ⇄ revision ⇄ links/tags/presence) where relationships are first-class and queryable. citeturn2view0turn17view0turn18view3  
- Demonstrates at least one “Arkiv-native” feature that a normal web2 DB doesn’t encourage (time-scoped presence, expiring drafts, sliding TTL, etc.). citeturn7view0turn19view3turn2view1

The timeline in the official repository indicates submissions opened Feb 23 and close Mar 6 (23:59 UTC), with judging immediately after. citeturn31view0turn3view2  
So your architecture must be *implementable fast*, but still *deeply Arkiv-shaped*.

## Fit analysis of BookStack as a foundation for this challenge

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["BookStack screenshot page editor interface","BookStack screenshot global search interface","BookStack screenshot books chapters pages hierarchy"],"num_per_query":1}

### What BookStack gives you quickly

BookStack is a mature open-source documentation/wiki platform with an opinionated UX, built‑in editing, hierarchy (books/chapters/pages), and strong “works out of the box” usability. citeturn29view0turn30view2  
It is also explicitly MIT-licensed and positioned as “simple & free wiki software,” which makes it attractive as a “starter pack” from a product standpoint. citeturn29view0turn30view2

### The issue: BookStack’s core architecture is the opposite of the Arkiv-first requirement

For this builders challenge, the Knowledge Base track minimum requirements say **core data must be stored as Arkiv entities (not in a traditional database)**. citeturn2view0  
BookStack, by its own documentation, is “primarily a database-driven system,” with the “vast majority of data and metadata” in database tables. citeturn30view3  
It even documents that page content is stored in the `pages` table (`html` column), with markdown stored in a `markdown` column when used. citeturn30view3

That means: if you “just fork BookStack,” you will naturally end up storing your docs in MySQL, which is precisely what the track says not to do for core data. citeturn29view0turn30view3turn2view0

### Extensibility is also a problem under hackathon time pressure

BookStack’s admin docs explicitly describe the core as “fairly rigid,” and warn that customization options are “not deemed to be stable or officially supported.” citeturn30view0turn30view1  
The repository itself also states: “BookStack is not designed as an extensible platform” for other purposes. citeturn30view2

You *can* integrate externally (REST API, webhooks, “logical theme system”), but converting the **entire persistence layer** from SQL tables to Arkiv entities would be a deep, risky re-architecture in PHP/Laravel—while Arkiv’s best-supported SDK path (and the challenge’s own “start building” links) emphasize TypeScript and Python tooling. citeturn31view0turn7view1turn7view2

### Conclusion on BookStack fit

BookStack is a strong **UX reference** and an excellent “feature checklist” for what users expect in a documentation tool. citeturn29view0turn30view3  
But as a **codebase foundation** for this specific Arkiv-first hackathon track, it is a poor fit because:

- It is SQL-first by design. citeturn30view3  
- Replacing its storage layer would likely consume most of your build window and still risk a shallow Arkiv integration score. citeturn2view1  
- It is not intended as an extensible platform for major architectural repurposing. citeturn30view2turn30view0  

**Recommendation:** Use BookStack as inspiration for information architecture (spaces + navigation + search + revisions), but build an Arkiv-first app directly in TypeScript so the Arkiv integration is the “spine,” not a bolt-on.

## Winning architecture for an Arkiv-first knowledge base

### Architectural goal

Build a knowledge base where:

- Browsing is public (no wallet needed). citeturn2view0turn27view3  
- Writing/updating requires wallet signatures, and entity ownership is wallet-bound. citeturn16view0turn17view0turn18view3  
- All core domain data (spaces/pages/revisions/links/tags) lives as Arkiv entities. citeturn2view0turn7view0  
- Entities have explicit expiration and extension strategy (including “Redis-like” sliding TTL where it makes sense). citeturn7view0turn15view3turn28view1  
- Updates happen via Arkiv **updateEntity** / **mutateEntities** when appropriate (instead of always create-new), aligning perfectly with your kickstart call notes. citeturn15view0turn15view1  

### A concrete system layout

Client-first is viable because Arkiv supports:
- **Public read clients** for querying without private keys. citeturn7view0turn27view3turn16view3  
- **Wallet clients** that can create, update, delete, extend entities. citeturn16view2turn15view0turn15view3  
- **Event subscriptions** for real-time entity-created/updated/expired signals. citeturn19view3turn19view2turn16view3  

So the winning submission can be:

- **Frontend:** TypeScript web app (for example Next.js/Vite) that uses:
  - `createPublicClient()` for all browse/read views. citeturn7view0turn16view3  
  - `createWalletClient()` for write flows (create/update/extend/delete). citeturn13view0turn16view2  
- **Optional lightweight backend (only if needed):** build tools, seed scripts, or a demo “publisher” service—not required for core functionality since the app can be fully client-driven. The Learn Arkiv tutorial demonstrates a split backend publisher + frontend visualizer pattern, but for Knowledge Base you can keep it client-only unless you add optional indexing. citeturn27view2turn27view3  

### The entity model that scores highly

Arkiv entities consist of a binary payload + key/value attributes + expiration. citeturn7view0turn15view2turn16view0  
They can be queried via a SQL-like predicate language, and the SDK’s QueryBuilder compiles predicates into `arkiv_query` calls. citeturn7view0turn17view0turn18view3turn16view1  

A high-scoring knowledge base should define at least the following **entity types** (each “type” stored as an attribute like `type="kb.space"`):

**Space entity (project / knowledge base root)**  
Purpose: top-level container.  
- Payload (JSON): `{ name, description, createdBy, createdAt, ... }`  
- Attributes (queryable):  
  - `type = "kb.space"`  
  - `spaceSlug = "my-space"`  
  - `visibility = "public" | "unlisted" | "private"`  
- Expiration: long (ex: months), with extension policy. citeturn7view0turn28view1  

**Page entity (canonical latest state)**  
Purpose: “current page value” for fast reads.  
- Payload: `{ title, bodyMarkdown, bodyHtml?, updatedBy, ... }`  
- Attributes:  
  - `type = "kb.page"`  
  - `spaceKey = <space entityKey>`  
  - `pageSlug = "getting-started"`  
  - `parentPageKey = <optional>` (for tree/hierarchy)  
  - `status = "draft" | "published" | "archived"`  
  - `title = "Getting Started"` (for basic search)  
- Expiration: long, but with *sliding TTL* if you choose. citeturn15view3turn28view1  

**Revision entity (append-only history)**  
Purpose: real audit trail; great for scoring “relationships” and “advanced features.”  
- Payload: `{ pageKey, diffOrFullBody, editedBy, editSummary }`  
- Attributes:  
  - `type = "kb.revision"`  
  - `pageKey = <page entityKey>`  
  - `spaceKey = <space entityKey>`  
  - `editedBy = <wallet address>`  
- Expiration: shorter by default (e.g., weeks/months) but can be extended for “milestone revisions.” citeturn7view0turn15view3  

**Link edge entity (page → page graph)**  
Purpose: “crear estructuras que se inter-relacionen” made explicit.  
- Attributes:  
  - `type = "kb.link"`  
  - `fromPageKey`, `toPageKey`, `spaceKey`  
- Enables: backlinks view, broken link detection, graph navigation.  
- Expiration: can match page lifespan (or shorter + re-generated).  

**Presence entity (the “Redis-like” Arkiv-native feature)**  
This is a killer feature for the rubric because it uses Arkiv’s time-scoped nature in a way a normal DB doesn’t push you toward. Arkiv itself frames expiration as a core concept (“Expires In”) and highlights “temporary data storage” as a use case. citeturn7view0turn8search3  
- Create `type="kb.presence"` entities with `expiresIn ~ 60s` and extend them while a user has a page open. citeturn15view3turn28view1  
- Show “Currently viewing” as a live list via queries + event subscriptions. citeturn19view3turn16view3  

### How to implement “updates not new entities” without losing history

Your kickstart note (“crear updates cuando se puede en lugar de entidades nuevas”) maps directly onto Arkiv’s write API, which supports:

- `updateEntity({ entityKey, payload, attributes, contentType, expiresIn })` citeturn15view0turn16view2  
- `mutateEntities({ creates, updates, deletes, extensions, ownershipChanges })` for batching multiple operations atomically. citeturn15view1turn7view1turn27view2  

A strong pattern for pages:

- On save:
  - **Create** a revision entity (history is append-only).
  - **Update** the canonical page entity with the new body/title/status.
  - Optionally **extend** expiration for both page and space if needed.
- Do that in a single `mutateEntities` call for “deep integration” credibility. citeturn15view1turn15view0  

### Expiration strategy that will impress judges

Arkiv’s docs emphasize “programmable expiration” and “pay only for storage duration,” and the challenge guide wants “rational expiration dates.” citeturn7view0turn2view0turn8search3  

A proposal that creates a coherent story:

- Spaces/pages: long expiration (months to a year).  
- Draft pages: short expiration (days).  
- Presence: very short expiration (seconds/minutes).  
- Revisions: medium expiration (weeks/months), with UI to “pin” (extend) major revisions.  
- Link graph edges: short expiration + periodic regeneration (so you demonstrate lifecycle management, not permanence).  

Using Arkiv’s `extendEntity` makes the lifecycle explicit. citeturn15view3turn16view2  

## Implementation plan with goals, tests, and acceptance criteria

This plan is designed for the remaining window until submission close (Mar 6). citeturn31view0turn3view2  
It prioritizes Arkiv integration depth early (because it is both the largest score weight and the tie-breaker). citeturn2view1  

### Step one: Project skeleton and chain connectivity

**Description**  
Set up a TypeScript web app, add Arkiv SDK dependency, and implement:
- A public “read-only” client for browsing. citeturn16view3turn27view3  
- A wallet client path for writes. citeturn16view2turn13view0  

**Tests**  
- Smoke test: query an entity count (or fetch a known entity by key). citeturn16view3turn16view1  
- Smoke test: create an entity on testnet and fetch it back. citeturn15view2turn13view0turn7view0  

**Goal**  
Prove end-to-end read/write.

**Acceptance criteria**  
- A user can open the app with no wallet and the app loads a “Public Explore” view populated by Arkiv queries.
- With wallet connected, a user can create a test entity and see it retrieved by key.

### Step two: Define the entity schema contracts

**Description**  
Write a small “schema module” that:
- Generates payload + attributes for each entity type (space/page/revision/link/presence).
- Enforces required attributes (`type`, foreign keys).
- Enforces `contentType` and payload encoding (JSON). citeturn28view0turn15view2turn15view0  

**Tests**  
- Unit tests validating that each builder outputs required attributes and a payload that can be parsed. citeturn16view0turn28view0  

**Goal**  
Make schema choices explicit and consistent—this directly impacts “entity schema design” scoring. citeturn2view1  

**Acceptance criteria**  
- Every entity builder produces deterministic attribute keys.
- “type” is always present and stable across app versions.

### Step three: Spaces lifecycle MVP

**Description**  
Implement:
- Create space (wallet required).
- List spaces (public, query-based).
- Space landing page (public). citeturn2view0turn17view0turn18view3  

Use attributes like `type="kb.space"` and `spaceSlug` so listing is a query, not a local array.

**Tests**  
- Integration test (manual or scripted): create a space; query spaces; open it publicly by slug.
- Query correctness: ensure `.where(eq('type','kb.space'))` returns the new space. citeturn18view1turn17view0  

**Goal**  
Satisfy the vertical “space” requirement, Arkiv-first. citeturn2view0  

**Acceptance criteria**  
- Creating a space returns an entityKey and it appears in public browse within a short time window (document the observed latency in README).

### Step four: Pages CRUD with canonical page + revision history

**Description**  
Implement:
- Create page within a space.
- Edit page via **updateEntity** rather than “create new page entity.” citeturn15view0turn16view2  
- On every edit, also create a revision entity (history).  
- Use `mutateEntities` to do “create revision + update page” in one transaction. citeturn15view1turn27view2  

**Tests**  
- Unit test: “save operation” produces one update op + one create op.
- Manual integration: edit a page twice; verify:
  - Canonical page shows latest content.
  - Revisions list shows two entries queried by `pageKey`. citeturn17view0turn18view3  

**Goal**  
Demonstrate deep lifecycle handling: updates + append-only history.

**Acceptance criteria**  
- Page URL (spaceSlug/pageSlug) always resolves to the canonical page entity.
- Revision list loads via Arkiv queries, not from cached local state.

### Step five: Navigation and interrelated structures

**Description**  
Add:
- Page hierarchy (parentPageKey) with ordering using numeric attributes + `orderBy`. citeturn17view0turn18view3  
- Link graph extraction:
  - Parse page body for `[[wiki-links]]` (or similar).
  - Write link-edge entities (`kb.link`) on save: delete previous edges, create new ones in a batch. citeturn15view1turn19view1  
- Backlinks view (query `kb.link` where `toPageKey = currentPageKey`).

**Tests**  
- Unit test: link parser produces stable edge list.
- Integration: edit a page to add/remove links; backlinks reflect changes after mutate tx.

**Goal**  
Maximize “entity relationships” score and satisfy “crear estructuras que se inter-relacionen.”

**Acceptance criteria**  
- A page can display backlinks derived purely from Arkiv query results.

### Step six: Filtering and search that truly uses attributes

**Description**  
Implement search and filters as **Arkiv queries**, not client filtering:
- Filter by space, status, author (`$owner`), tags (if added). citeturn18view3turn17view0  
- Basic title search: at minimum exact match via `title` attribute.
- Stretch: token attributes (e.g., `token="arkiv"`) to enable keyword search via predicates.

**Tests**  
- Query snapshot tests: given user inputs, verify generated query string includes required predicates (spaceKey, status, tokens). citeturn18view3turn17view0  

**Goal**  
Score well on “query usage” and “filtering/search.” citeturn2view1  

**Acceptance criteria**  
- Search/filter combinations produce Arkiv query predicates (document examples in README).

### Step seven: Expiration engine and “Redis-like” behavior

**Description**  
Implement expiration policy per entity type plus two Arkiv-native features:

- **Sliding TTL for drafts/presence:**  
  - Presence entities expire quickly and are extended while active. citeturn28view1turn15view3  
- **Keep-alive for owned pages/spaces:**  
  - If a page you own is within N days of expiration, offer one-click `extendEntity`. citeturn15view3turn16view2  

**Tests**  
- Unit tests for “expiration policy” function outputs for each type.
- Demo script: create presence entity and show it disappears if not extended (record as a GIF/video for judges).

**Goal**  
Directly hit the rubric’s expiration strategy category and your kickstart note (“buen manejo de las expiraciones”). citeturn2view1turn7view0  

**Acceptance criteria**  
- Presence list updates correctly as entities expire.
- At least one screen in the demo visibly shows expiration behavior (this matters for judges).

### Step eight: Real-time updates via Arkiv events

**Description**  
Use `subscribeEntityEvents` to update UI when:
- Pages in a space are updated.
- Presence entities are created/extended/expired. citeturn19view3turn19view2  

**Tests**  
- Manual: open the same space in two tabs; edit in one; see update banner or auto-refresh in the other.

**Goal**  
Score “advanced features” and show this is built for live data. citeturn2view1turn7view1  

**Acceptance criteria**  
- Demo shows at least one “live update” effect driven by Arkiv events (not polling).

### Step nine: UX polish and “no wallet needed to browse” guarantee

**Description**  
- Ensure the default experience is browse-first (public read).
- Wallet prompts only appear when you click “Create / Edit / Join presence.”
- Add clear “ownership boundary” messaging: only owners can update/extend entities. citeturn16view0turn18view3  

**Tests**  
- E2E: a new user with no wallet can:
  - Browse spaces
  - Open a page
  - Search within a space

**Goal**  
Maximize design/UX scoring while meeting vertical requirements. citeturn2view0turn2view1  

**Acceptance criteria**  
- A judge can use your demo without a wallet and still see substantial functionality.

### Step ten: Submission packaging and judge-optimized documentation

**Description**  
Ship what judges actually score:
- Public GitHub repo, clear README, architecture diagram, entity schema table, and “how to test quickly.” citeturn31view0turn3view2turn2view1  
- Deployed demo URL + short walkthrough video showing:
  - Create space
  - Create & edit page (updateEntity)
  - Revision history
  - Presence expiration in action
  - Live updates (events)

**Tests**  
- “Fresh laptop test”: clone, configure env, run locally in <15 minutes.
- “Demo failure mode test”: RPC downtime shows graceful UI errors.

**Goal**  
Avoid losing points to documentation or runtime fragility.

**Acceptance criteria**  
- README includes at least 3 example Arkiv queries used by the app.
- README clearly states which data is “core” and guaranteed stored as Arkiv entities.

## Predicted final score based on the official rubric

The scoring system uses a 1–5 scale across four weighted categories:
- Arkiv integration depth (40%)
- Functionality (30%)
- Design & UX (20%)
- Code quality & documentation (10%) citeturn2view1  

Because Arkiv integration is the biggest weight and the tie-breaker, the presence/lifecycle features and updateEntity usage are not “nice extras”—they are score multipliers. citeturn2view1turn15view0turn19view3  

### Realistic scoring range

**If you deliver the plan through Step seven (expiration strategy + updates + relationships), but only minimal real-time events:**
- Arkiv integration: ~4.1–4.5 (deep schema + rational expiration + updates) citeturn2view1turn15view1turn2view0  
- Functionality: ~3.8–4.2 (solid CRUD + filters/search) citeturn2view1turn2view0  
- Design & UX: ~3.7–4.1 (depends on polish) citeturn2view1  
- Code quality/docs: ~4.0 (if README is strong and schema is clean) citeturn2view1  

**Weighted predicted score:** ~4.0–4.3 / 5.

**If you also deliver Step eight (real-time via events) + a judge-friendly demo narrative:**
- Arkiv integration: ~4.5–4.8 (advanced feature proof) citeturn19view3turn2view1  
- Functionality: ~4.1–4.4  
- Design & UX: ~4.0–4.4  
- Code quality/docs: ~4.2–4.6  

**Weighted predicted score:** ~4.3–4.6 / 5.

### What that implies about “winning”

There are only two winners. citeturn31view0turn3view2  
Without knowing the competitor field, no prediction can be certain. But in hackathon judging, a ~4.3+ across this rubric generally signals a top-tier submission—especially if Arkiv integration is distinctly deep and clearly demonstrated.

## Integration resources and “sources of wisdom” for Arkiv-first builds

Below is a curated link set aligned to exactly what you’re building (knowledge base + deep entity lifecycle).

```text
Challenge + rules + scoring
https://github.com/Arkiv-Network/arkiv-web3-database-builders-challenge
https://raw.githubusercontent.com/Arkiv-Network/arkiv-web3-database-builders-challenge/main/docs/builders-guide.md
https://raw.githubusercontent.com/Arkiv-Network/arkiv-web3-database-builders-challenge/main/docs/scoring-rubric.md
https://raw.githubusercontent.com/Arkiv-Network/arkiv-web3-database-builders-challenge/main/RULES.md
https://raw.githubusercontent.com/Arkiv-Network/arkiv-web3-database-builders-challenge/main/FAQ.md

Arkiv docs + getting started
https://arkiv.network/docs
https://arkiv.network/getting-started/typescript
https://arkiv.network/getting-started/python
https://arkiv.network/playground

Arkiv GitHub + SDKs
https://github.com/arkiv-network
https://github.com/Arkiv-Network/arkiv-sdk-js
https://github.com/Arkiv-Network/arkiv-sdk-python
https://github.com/arkiv-network/learn-arkiv
https://arkiv-network.github.io/learn-arkiv/

BookStack reference (for UX inspiration, not Arkiv-first storage)
https://github.com/BookStackApp/BookStack
https://www.bookstackapp.com/
https://www.bookstackapp.com/docs/admin/content-storage/
https://www.bookstackapp.com/docs/admin/hacking-bookstack/
```

Key takeaways from the Arkiv SDK itself (use these as “proof points” in your README):

- Arkiv supports **updateEntity** (so you can update instead of creating new entities). citeturn15view0turn16view2  
- Arkiv supports **mutateEntities** batching creates/updates/deletes/extensions, which is ideal for “page update + revision create” atomic writes. citeturn15view1turn7view1  
- Arkiv supports **extendEntity** for lifecycles and TTL strategy. citeturn15view3turn16view2  
- Arkiv supports **subscribeEntityEvents** to build real-time UX without centralized websockets. citeturn19view3turn16view3  
- The QueryBuilder compiles predicates into Arkiv’s query language and supports ownership filters and ordering, enabling you to keep search/navigation Arkiv-native. citeturn17view0turn18view3