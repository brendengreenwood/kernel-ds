---
name: kernel-ds-document
description: Write or repair typed component documentation — docs blocks, coverage parity, and prose quality for catalog entities. Use for documentation work, doc coverage failures, or docs-block authoring.
triggers: document a component, docs blocks, doc coverage, documentation record, prose
user-invocable: true
---

# Kernel DS — document an entity

## When to use

Authoring or fixing typed documentation for catalog entities.

## Workflow

1. Doc entities live in `kernel-portal/src/lib/component-docs` — one file per slug, registered in the barrel index, parsed by the typed schema (nine block kinds; conformance: minimal → documented → complete).
2. `npm run ds:add` scaffolds the skeleton for new entities; fill guidelines (dos/donts), anatomy (slots), use cases, api, and accessibility blocks.
3. Keep `sourceFiles` accurate — parity against real source is enforced, and ds-bundle prompt guidance is generated from these blocks.
4. Prose must be specific to the grain-buying domain; mad-lib phrasing fails the prose-quality gate.

## Verification

- `node kernel-portal/scripts/check-component-docs.mjs` with `--coverage` from `kernel-portal/` — expect 0 violations.
- `node kernel-portal/scripts/check-prose-quality.mjs` for prose gates.
- `npm run ds:doctor` — documentation readiness for ready-maturity entities.
