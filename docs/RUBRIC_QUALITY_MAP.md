# Rubric Quality Map

## README mapping
Primary proof points in [README.md](../README.md):
- architecture diagram and schema table,
- environment/setup/verification commands,
- ownership/read-vs-write boundary,
- lifecycle/expiration policy,
- testing and evidence sections.

## Code organization mapping
Primary organization evidence:
- `src/arkiv/*`: data-layer contracts and operations.
- `src/features/*`: cross-cutting feature boundaries (auth, ownership, visibility, hierarchy, migration, agent).
- `src/app/*`: route composition and UI integration.
- `scripts/*`: verification and artifact automation.
- `tests/*`: layered confidence model (unit/integration/e2e/live).

## Code quality mapping
Primary quality proof points:
- strict TS config in `tsconfig.json`,
- lint/type/test gates via `pnpm verify`,
- submission/evidence validation scripts (`verify:submission`, `verify:evidence`),
- docs quality report generation (`verify:docs-quality`) with CI artifact upload.

## Evidence commands
```bash
pnpm verify
pnpm verify:submission
pnpm verify:evidence
pnpm verify:docs-quality
```

Artifacts:
- Evidence pack: `output/playwright/evidence-pack/`
- Docs quality report: `output/docs-quality/report.json`
