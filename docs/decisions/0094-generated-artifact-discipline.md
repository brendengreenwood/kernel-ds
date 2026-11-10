# 0094 — Hand-maintained registries become generated artifacts

Status: accepted
Date: 2026-11-09

## Decision

Three hand-maintained registries are now generated artifacts with staleness gates, promoted from the `play/fable-refactor` experiment:

1. **Catalog entities.** `packages/catalog/src/entities/` holds one JSON file per entity; `packages/catalog/src/entities.ts` is generated from the store in kind-ladder order (decision 0057). `check-catalog.mjs` fails with `entities.ts is stale` when they drift. Entity counts are no longer pinned in checks or tests.
2. **Component-docs barrel.** `kernel-portal/src/lib/component-docs/index.ts` is generated from the `<slug>.ts` doc entities by `generate-component-docs-index.mjs`; `check-component-docs.mjs` fails with `COMPONENT-DOCS-INDEX-STALE` when it drifts.
3. **Styles monolith.** `packages/ui/src/styles.css` is generated verbatim from nine ordered partials in `packages/ui/src/styles/` by `packages/ui/scripts/generate-styles.mjs`; `--check` fails with `STYLES-STALE`. The partials are the source of truth; the monolith stays byte-stable for every consumer (Tailwind entry, dist copy, token parsers, audits).

Additionally, `scripts/ds/lib/gates.mjs` is the single registry of verification gates. `ds:verify` selects gates from changed paths (or `--all`), and `ds:doctor` gains a gate-coverage check that fails when the manifest and CI drift apart.

## Why

Registries maintained by hand drift from the things they index. `ds:verify` ran only 3 of ~14 CI checks; entity counts were pinned in four places and ratcheted on every add; the 49 KB styles.css invited merge conflicts in unrelated token work. The pattern that fixed each one is the same: data + generator + exit-1 staleness gate.

## Consequences

- Edit the per-entity JSON, the `<slug>.ts` doc entities, or the CSS partials — never the generated files.
- `entities.ts` was re-sorted once into decision-0057 order when the store was created; the churn was normalization, not data change.
- Studio's bundle-count pin was already removed on main; the play commit for it was redundant and skipped.
