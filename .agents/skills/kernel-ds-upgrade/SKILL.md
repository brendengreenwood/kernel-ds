---
name: kernel-ds-upgrade
description: Upgrade a managed consumer to a newer @kernel/ui or @kernel/definitions version — read release notes, apply migrations, and re-verify the consumer. Use for consumer upgrade or migration work.
triggers: upgrade the consumer, migrate a consumer, upgrade packages, latest tarballs, migration notes
user-invocable: true
---

# Kernel DS — upgrade a consumer

## When to use

Moving an application to newer package versions.

## Workflow

1. Check the consumer is registered and the registry is healthy: `npm run consumers:check` (registry: `scripts/ds/consumers.json`; managed entries are opt-in only).
2. Plan first: `npm run ds:upgrade -- --consumer <id> --dry-run` — prints the dependency diff, migrations, docs anchors, registered verification commands, and suggested branch from the impact manifest (`npm run release:impact` regenerates it).
3. Apply through the same command: `npm run ds:upgrade -- --consumer <id> --apply` — updates dependencies, installs, and runs the consumer's registered verification; a failure restores the consumer and blocks propagation.
4. For manual migration work, compare public surfaces: `packages/ui/api.json` and `packages/definitions/api.json` inventory every export — removed or renamed symbols are the migration checklist. Keep React peer-resolved to a single copy.
5. The decision-0036 `kernel-app` vendored fork is **not** a managed consumer — `ds:upgrade` refuses it, and enrolling requires an explicit user amendment.

## Verification

- `npm run consumers:check` — `CONSUMERS-CHECK-OK`.
- `npm run ds:upgrade -- --consumer <id> --dry-run` — `DS-UPGRADE-OK` with the planned diff.
- Consumer typecheck + production build pass on the new versions (applied automatically by `--apply`).
- No duplicate React in the consumer lockfile.
- Definition documents still validate against the new `@kernel/definitions` schemas.
