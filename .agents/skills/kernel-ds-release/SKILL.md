---
name: kernel-ds-release
description: Prepare a design-system release — record changesets, gate the pack payload, and (once release automation lands) version and publish to the private registry. Use for release, versioning, or changeset work.
triggers: release, changeset, version bump, publish, cut a release
user-invocable: true
---

# Kernel DS — release the packages

## When to use

Any change to `@kernel/ui` or `@kernel/definitions` that consumers will receive.

## Workflow

1. Record intent with every consumer-visible change: `npm run ds:changeset -- --package <name> --bump <patch|minor|major> --summary "<what changed for consumers>"`. Filenames are content-hashed; reruns are idempotent.
2. Bump discipline: breaking export/schema changes are `major`, added surface is `minor`, fixes are `patch`. The serialized definition JSON shape is part of the public contract.
3. Gate the payload before any release: `npm run ds:pack` — dist-only payload plus `package.json`/`api.json`/`README.md`; anything else is a leak.
4. A release is forbidden unless packed-consumer, catalog parity, package API, portal, and Studio gates all pass (`npm run ds:verify -- --all`).
5. Version/publish execution to private GitHub Packages is completed in the release segment; until then, changesets accumulate and `ds:pack` is the payload truth.

## Verification

- `npm run ds:pack` — `DS-PACK-OK` for both packages.
- `npm run ds:verify -- --all` before any version is cut.
- Changeset files exist under `.changeset/` for every consumer-visible change.
