# Quality Standards

## TypeScript standards
- Keep `strict` type safety intact (no broad `any` fallback for core domain code).
- Preserve explicit domain types in `src/arkiv/types.ts` and feature contracts.
- Prefer narrow, composable helpers over route-local implicit casting.

## Testing taxonomy
- Unit tests:
  - schema/parsers/expiration/auth/tokenization/domain helpers.
- Integration tests:
  - mutation orchestration, canonical resolution, ownership transfer, cleanup semantics.
- Component e2e tests:
  - wallet gates, visibility UX, authoring flow behavior, search/filter serialization.
- Live smoke:
  - optional funded-key create/read-back against Arkiv network.

## Error handling conventions
- Route reads should render recoverable error states with retry affordances.
- Mutation paths should surface user-actionable messages (network/chain/balance/ownership).
- Unknown provider failures should be normalized (never expose `Transaction failed: undefined` to users).

## Observability/logging rules
- Keep key lifecycle logs around critical mutation orchestration and repair paths.
- Keep tx prompt lifecycle logs (`[arkiv-tx:*]`) for browser-level troubleshooting.
- Keep presence lifecycle logs (`[presence-heartbeat]`) for delegated renew/debug paths.
- Avoid logging secrets, raw private keys, or session token content.

## Review checklist
- Does the change preserve Arkiv as authoritative core storage?
- Are ownership and private-read checks still explicit and test-covered?
- Are docs updated for judge-facing claims when behavior changes?
- Do commands in docs still run as documented?
- Does CI still produce reproducible evidence artifacts?
