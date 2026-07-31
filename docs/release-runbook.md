# Kernel DS release runbook

How `@kernel/ui` and `@kernel/definitions` are versioned and published to private GitHub Packages. `@kernel/catalog` is internal tooling and is never published.

## Per-change ritual

1. `npm run ds:changeset -- --package <name> --bump <patch|minor|major> --summary "<consumer-visible change>" --classification <runtime|api|docs|internal> [--entities <ids> | --scope package] [--breaking --migration "<how to adapt>"]`
2. `npm run release:impact` — regenerate `.release/impact-manifest.json` and review affected entities.
3. `npm run release:check` — must print `RELEASE-CHECK-OK`.

## Cutting a release

1. All gates green: `npm run ds:verify -- --all`, `npm run ds:pack`, packed-consumer proof.
2. `npm run changeset:status` — confirm the planned bumps.
3. `npx changeset version` — apply versions and changelogs (commit the result).
4. Publication runs only through the release workflow with environment-protected credentials; never publish from a local machine or an unverified commit.

## Release workflow (`.github/workflows/release.yml`)

- Manual-only (`workflow_dispatch`) with a `mode` input; there is no automatic trigger that can publish.
- `dry-run` (default): changeset status, `release:check` (metadata + publishable config + temp-worktree version dry run), `release:impact`, and `ds:pack` — no credentials touched; the impact manifest and tarballs are attached as run artifacts.
- `publish`: only from `main`, only in the protected `release` environment, and refuses to start unless the `KERNEL_DS_PUBLISH_TOKEN` secret is configured. It re-runs every release gate on the exact commit (ds:check, doctor, release:check, both package builds/tests/contracts, catalog integrity, portal build+lint, Studio typecheck+tests, pack + consumer smoke) before `changeset publish`. Consumer propagation stays local: after publication, run `npm run ds:upgrade -- --consumer <id> --dry-run` per opted-in consumer and apply through `ds:upgrade`.
- Workflow safety is enforced by `scripts/ds/__check__.mjs` (manual-only trigger, credential-free dry run, protected/gated publish, no literal tokens, gates ordered before publish).

## Registry and auth

- Registry: `https://npm.pkg.github.com`, `publishConfig.access: restricted` in each publishable package.
- Auth: `NODE_AUTH_TOKEN` provided by the release workflow environment (GitHub Actions `GITHUB_TOKEN` with `packages: write`, or an org-scoped token). Nothing auth-related is committed; `release:check` scans committed config surfaces for credentials.
- Scope assumption: `@kernel` must map to an owning GitHub organization for npm.pkg.github.com publication. Until that mapping exists, dry-run/pack/impact remain the verified path and live publish is blocked (documented limitation, decision 0048).

## Rollback / recovery

- Prefer roll-forward: publish a patch that reverts the regression, with its own changeset and migration notes.
- GitHub Packages supports deleting/yanking a version (repo admins) — after yanking, publish a corrected version; never reuse a version number.
- Partial publish (one package published, the other failed): fix the failure and re-run the workflow; already-published versions are skipped. The impact manifest records the intended version set for auditing.
- Deprecation: mark superseded versions with `npm deprecate <pkg>@<version> "<reason>"` against the GitHub Packages registry (requires the same publish credentials); record the deprecation and its replacement in a changeset with `--classification docs` so the impact manifest carries the notice to consumers.
