---
name: kernel-ds-release
description: Prepare a design-system release — record classified changesets, generate impact manifests, gate the pack payload, and version/publish to private GitHub Packages. Use for release, versioning, or changeset work.
triggers: release, changeset, version bump, publish, cut a release
user-invocable: true
---

# Kernel DS — release the packages

## When to use

Any change to `@kernel/ui` or `@kernel/definitions` that consumers will receive.

## Workflow

1. Record intent with every consumer-visible change: `npm run ds:changeset -- --package <name> --bump <patch|minor|major> --summary "<what changed for consumers>" --classification <runtime|api|docs|internal>`. Runtime/API changes must add `--entities <catalog ids>` (or `--scope package`); breaking changes must add `--breaking --migration "<how consumers adapt>"`. Filenames are content-hashed; reruns are idempotent.
2. Bump discipline: breaking export/schema changes are `major`, added surface is `minor`, fixes are `patch`. The serialized definition JSON shape is part of the public contract.
3. Build the impact manifest: `npm run release:impact` — planned versions, relationship-expanded affected entities, migrations, and docs anchors land in `.release/impact-manifest.json`.
4. Gate the release: `npm run release:check` — metadata policy, publishable package config, no committed credentials, and a mutation-free `changeset version` dry-run.
5. Gate the payload: `npm run ds:pack` — dist-only payload plus `package.json`/`api.json`/`README.md`; anything else is a leak.
6. A release is forbidden unless packed-consumer, catalog parity, package API, portal, and Studio gates all pass (`npm run ds:verify -- --all`).
7. Publication targets private GitHub Packages (`https://npm.pkg.github.com`, restricted access). Registry auth lives only in the release workflow environment — never in committed files.

## Verification

- `npm run release:check` — `RELEASE-CHECK-OK` with planned versions.
- `npm run release:impact` — `RELEASE-IMPACT-OK` and a schema-valid manifest.
- `npm run ds:pack` — `DS-PACK-OK` for both packages.
- `npm run ds:verify -- --all` before any version is cut.
