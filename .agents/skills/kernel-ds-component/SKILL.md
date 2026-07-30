---
name: kernel-ds-component
description: Add or change a canonical UI component in @kernel/ui — scaffold the catalog entity, implement in the package, document, and regenerate. Use for new components or changes to existing package-owned primitives.
triggers: add a component, new component, change a component, ui primitive
user-invocable: true
---

# Kernel DS — add or change a component

## When to use

A new or changed public UI primitive owned by `@kernel/ui`.

## Workflow

1. Register first: `npm run ds:add -- --kind component --name "<Name>" --docs-dir kernel-portal/src/lib/component-docs` — scaffolds the catalog entity plus docs skeleton and refuses collisions.
2. Implement in `packages/ui/src/components/ui/` (kebab-case file, `data-slot` attributes, tokens only — no hardcoded control heights or raw colors).
3. Fill the docs blocks, add `sourceFiles` to the catalog entity, and register the gallery cluster per the `kernel-feature` skill.
4. Regenerate everything in order: `npm run ds:generate` (catalog adapter → packages → ds-bundle → inventories).
5. Relationships/tags go through `npm run ds:relate` and `npm run ds:tag`, never hand-edited JSON.

## Verification

- `npm run ds:verify` — selects the ui/catalog/portal gates from your changed paths.
- `npm run ds:doctor` — must report 0 violations (API alignment, docs, a11y readiness).
- `node kernel-portal/scripts/check-component-docs.mjs` with `--coverage` from `kernel-portal/`.
