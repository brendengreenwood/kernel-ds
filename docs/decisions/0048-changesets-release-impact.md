# 0048 — Changesets versioning with catalog-linked release impact

**Date:** 2026-07-30
**Status:** accepted

## Decision

Version `@kernel/ui` and `@kernel/definitions` independently with `@changesets/cli`, and derive a machine-readable impact manifest from changesets plus catalog relationships.

- `ds:changeset` now embeds a `kernel-ds:release-meta` JSON block (an HTML comment, so files stay @changesets/cli-compatible) carrying classification, breaking flag, migration, and affected catalog entities. Runtime/API classifications require entities or whole-package scope; breaking requires a migration; docs/internal are the explicit exemption path.
- `release:impact` builds `.release/impact-manifest.json` (`kernel-ds/impact-manifest@1`): planned versions, one-hop relationship-expanded affected entities, docs anchors, peer requirements, and verification commands. Deterministic: sorted packages/changes/entities, no timestamps.
- `release:check` gates metadata policy, publishable package configuration, committed-credential absence, and runs `changeset version` inside a temp worktree copy so verification never mutates the repository.
- `@kernel/ui` and `@kernel/definitions` publish to private GitHub Packages (`https://npm.pkg.github.com`, `access: restricted`); `@kernel/catalog` stays `private: true` as internal tooling. Registry auth lives only in the release workflow environment.
- Doctor's `version-alignment` check now asserts valid plain semver per package instead of identical versions, because independent versioning is the contract from this decision forward.

## Why

Release notes for humans and upgrade automation for consumers need one typed source: changesets alone say "what bumped", but only the catalog knows which entities, patterns, and dependent surfaces a change touches. Embedding classification at authoring time makes the exemption path explicit instead of implicit.

## Auth assumptions

Publishing under the `@kernel` scope on GitHub Packages requires an owning organization/scope mapping and a token with `packages:write`. Dry-run, pack, and impact generation are proven without credentials; live publish waits for configured repository secrets (see `docs/release-runbook.md`).
