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

1. Read the changesets/release notes between the versions — bump levels tell you whether migrations are expected (`.changeset/` entries; changelogs once release automation lands).
2. Compare public surfaces: `packages/ui/api.json` and `packages/definitions/api.json` between versions inventory every export — removed or renamed symbols are the migration checklist.
3. Install the new versions (tarballs from `npm run ds:pack -- --write`, or registry versions once published), keeping React peer-resolved to a single copy.
4. Apply migrations, then run the consumer's typecheck and production build.
5. The decision-0036 `kernel-app` vendored fork is **not** a managed consumer — never enroll it in upgrades.

## Verification

- Consumer typecheck + production build pass on the new versions.
- No duplicate React in the consumer lockfile.
- Definition documents still validate against the new `@kernel/definitions` schemas.
