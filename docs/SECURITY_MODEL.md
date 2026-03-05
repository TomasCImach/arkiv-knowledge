# Security Model

## Trust boundaries
- Browser client:
  - Public reads from Arkiv query paths.
  - Wallet-gated writes and signing.
- Server routes:
  - Wallet session verification endpoints.
  - Presence delegation signer route.
  - Agent intent generation and authenticated presence wrappers.
- Arkiv network:
  - Source of truth for core entities and ownership state.

## Auth model
- Private-read authorization:
  - challenge nonce issued by server,
  - wallet signs challenge message,
  - server verifies signature and issues signed HttpOnly session cookie.
- Write authorization:
  - user wallet signs transactions for create/update/delete/transfer/extend operations.
- Agent intent authorization:
  - session-backed signer identity is required for owner-scoped intent endpoints.

## Ownership enforcement
- Owner-only mutations are enforced in:
  - UI affordance gating,
  - mutation helper preconditions,
  - agent intent builders.
- Ownership transfer uses Arkiv `changeOwnership` on canonical entities (`kb.space`, `kb.page`).
- Private visibility read checks validate viewer wallet session against canonical entity owner.

## Threats mitigated
- Query-parameter spoofing for private reads (replaced with signed server session).
- Non-owner mutation attempts from UI and agent paths.
- Multi-wallet provider mismatch during signing (connector provider resolution).
- Opaque transaction failures by surfacing normalized wallet/provider errors.

## Known limitations
- Private pages are access-controlled but payload-encryption at rest is not yet implemented.
- Presence signer key is server-held; operational key management hardening is required for production.
- This challenge build prioritizes deterministic Arkiv lifecycle correctness and judge-observable behavior over full cryptographic content privacy.
