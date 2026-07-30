---
name: kernel-ds-definition
description: Author or change object models and workspace preset definitions through @kernel/definitions — the canonical schemas, validation, and Studio write path. Use for object model, workspace definition, or composition contract work.
triggers: workspace definition, object model, define an object, workspace preset, composition contract
user-invocable: true
---

# Kernel DS — author definitions

## When to use

Object models, workspace presets, or composition-contract changes.

## Workflow

1. Schemas live in `packages/definitions/src` — `parseObjectModel` and `parseWorkspacePreset` are the only entry points; serialized JSON shape is a compatibility contract (round-tripped by package tests).
2. Definition documents are files under `kernel-portal/public/definitions` registered in the manifest; Studio writes them through `kernel-studio-server/src/lib/definitions.ts` (validate-then-write, atomic manifest update).
3. Cross-package paths resolve only through `kernel-studio-server/src/lib/paths.ts` — never hardcode sibling paths.
4. Every status needs a `tone`; workspace presets enforce per-idiom coherence (grouped ⇒ groupByOptions, queries ⇒ savedQueries) at parse time.
5. Composition doctrine is data in `packages/definitions/src/composition.ts`; consumed via `@kernel/definitions/composition`.

## Verification

- `npm run definitions:test` and `npm run definitions:check` — fixture round-trips, rejection cases, package contract.
- `npm run studio:test` — Studio write-path tests (validation, path escapes, manifest idempotency).
