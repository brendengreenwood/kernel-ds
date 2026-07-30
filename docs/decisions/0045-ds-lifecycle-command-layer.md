# 0045 — DS lifecycle command layer

**Status:** accepted
**Date:** 2026-07-30

## Decision

The design-system lifecycle (AUTHOR → GENERATE → VERIFY → RELEASE → PROPAGATE) is encoded as a deterministic, noninteractive CLI under `scripts/ds/`, exposed as root scripts `ds:add`, `ds:tag`, `ds:relate`, `ds:generate`, `ds:verify`, `ds:doctor`, `ds:changeset`, and `ds:pack`.

## Why

Catalog registration, generation order, focused verification, and pack hygiene were rituals spread across scripts and skills. Agents and CI need one flag-driven entry point per lifecycle verb with stable verdict lines (`DS-*-OK` / `DS-*-REFUSED` / `DS-*-FAILED`) and exit codes.

## Shape

- Authoring commands write `packages/catalog/src/entities.ts` through a shared parser (`scripts/ds/lib/catalog-file.mjs`); the entity array is strict JSON and round-trips byte-for-byte. The inventory was normalized once (unicode escapes → literals) to make that invariant hold.
- `ds:generate` runs a declared step registry (catalog-adapter → ui-package → definitions-package → ds-bundle); later segments append steps rather than adding parallel scripts.
- `ds:doctor` runs a check registry (catalog validity, source-file existence, generated-adapter freshness, `@kernel/ui` api.json alignment, a11y readiness, version alignment, workspace membership) and is fixture-testable via `--fixture`.
- `ds:changeset` writes Changesets-format notes with content-hashed filenames; release execution is deferred to the release segment.
- Deterministic red/green tests live in `scripts/ds/__check__.mjs` against `scripts/ds/__fixtures__/`; mutating commands are tested only on temp copies.

## Consequences

- New generation steps and doctor checks must be registered in the existing registries, keeping order and coverage reviewable in one place.
- Skills and CI should call `npm run ds:*` instead of re-deriving underlying commands.
