# Engineering Documentation

## Purpose
This folder contains judge-facing engineering documentation for the Code Quality & Docs rubric area.
It explains architecture boundaries, security posture, and quality standards without requiring code deep-dives.

## Doc index
- [Architecture](ARCHITECTURE.md)
- [Security Model](SECURITY_MODEL.md)
- [Quality Standards](QUALITY_STANDARDS.md)
- [Rubric Quality Map](RUBRIC_QUALITY_MAP.md)
- [Contributing Guide](../CONTRIBUTING.md)

## How to use before submission
1. Read [Rubric Quality Map](RUBRIC_QUALITY_MAP.md) first to map rubric language to project artifacts.
2. Use [Architecture](ARCHITECTURE.md) to validate module boundaries and Arkiv-first data flow.
3. Use [Security Model](SECURITY_MODEL.md) to validate ownership/read-vs-write/private-read assumptions.
4. Run `pnpm verify:docs-quality` and attach `output/docs-quality/report.json` as evidence in CI artifacts.
