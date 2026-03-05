# Contributing

## Prerequisites
- Node.js 22.x
- `pnpm` 10.x
- WalletConnect project id for wallet UX flows
- Optional funded key for live smoke/evidence strict checks

## Local workflow
1. Install dependencies: `pnpm install`.
2. Start app: `pnpm dev`.
3. Run quality gates before opening a PR:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm test:e2e`
4. For submission-facing changes, also run:
   - `pnpm verify:submission`
   - `pnpm verify:evidence`
   - `pnpm verify:docs-quality`

## PR checklist
- [ ] Change is Arkiv-first (no off-chain core data mirror introduced).
- [ ] Read vs write boundary remains explicit (public browse; wallet-gated writes).
- [ ] Ownership and visibility semantics are preserved or updated with tests.
- [ ] Docs updated (`README`, `PLAN`, `EXPLANATIONS`, `ITERATION_LOG`, `DEMO_SCRIPT`) when behavior or judge flow changes.
- [ ] Verification commands were run and results captured in PR notes.

## Verification matrix
| Area | Command | Expected outcome |
|---|---|---|
| Lint/style | `pnpm lint` | No lint errors |
| Types | `pnpm typecheck` | No type errors |
| Unit + integration | `pnpm test` | All tests pass |
| Component e2e | `pnpm test:e2e` | All tests pass |
| Submission assets | `pnpm verify:submission` | Required sections/assets present |
| Evidence docs | `pnpm verify:evidence` | Required evidence docs present |
| Docs quality report | `pnpm verify:docs-quality` | Report generated at `output/docs-quality/report.json` |

## Definition of done
A change is done when:
- code/tests/docs are aligned,
- required verification commands pass (or intentional warnings are documented),
- and judge-facing flow remains demoable in 3-5 minutes without hidden manual recovery steps.
