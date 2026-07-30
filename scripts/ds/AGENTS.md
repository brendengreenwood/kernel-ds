# DS lifecycle commands

`scripts/ds/` implements the Kernel DS lifecycle CLI: AUTHOR → GENERATE → VERIFY → RELEASE → PROPAGATE. Every command is noninteractive and flag-driven so agents and CI can run them deterministically. Invoke through the root scripts (`npm run ds:<command>`), never by re-deriving the underlying steps.

## Commands

- `ds:add --kind <kind> --name <name> [--slug s] [--package p] [--docs-dir d]` — scaffold a catalog entity plus optional docs skeleton. Refuses existing ids/files; never overwrites.
- `ds:tag --entity <id> --tag <tag> [--remove]` — add/remove a closed-taxonomy tag; validates before writing.
- `ds:relate --entity <id> --type <type> --target <id>` — record a typed relationship; validates type and target existence first.
- `ds:generate [--list|--only ids|--skip ids]` — run generation in declared order: catalog-adapter → ui-package → definitions-package → agents-inventories → ds-bundle.
- `ds:verify [--all|--base <ref>]` — select and run the focused gates implied by changed paths; selection expands through each gate's `dependents` so package changes always re-run their consumers (portal/Studio).
- `ds:doctor [--fixture <dir>]` — report catalog, generated-artifact, API-alignment, a11y-readiness, version, and workspace violations; nonzero when actionable.
- `ds:changeset --package <name> --bump <patch|minor|major> --summary <text> --classification <runtime|api|docs|internal> [--entities ids | --scope package] [--breaking --migration <text>]` — write a Changesets-format note carrying a `kernel-ds:release-meta` block. Runtime/API changes must name catalog entities (or whole-package scope); breaking changes must ship a migration; docs/internal are the explicit exemption path. Content-hashed filename, idempotent reruns.
- `ds:pack [--package name] [--write --out dir]` — build + pack the distributable packages and verify the pack payload allowlist.
- `release:impact [--dir d --out f --print]` — build the machine-readable impact manifest (`kernel-ds/impact-manifest@1`) from pending changesets plus catalog relationship expansion: planned versions, affected entities, migrations, docs anchors, verification commands. Deterministic; default output `.release/impact-manifest.json` (gitignored).
- `release:check [--dir d]` — release gate: metadata policy, publishable package config (`@kernel/ui` and `@kernel/definitions` publish restricted to GitHub Packages; `@kernel/catalog` stays private), no committed credentials, and a `changeset version` dry-run in a temp worktree that never mutates the repo.
- `changeset:status` — @changesets/cli status listing pending releases.
- `consumers:check` — validate the managed-consumer registry (`scripts/ds/consumers.json`): schema, kebab-case ids, repository-relative paths, publishable package subscriptions, verification-command allowlist (npm/npx/node only), opt-in flags, and the decision-0036 unmanaged fence (kernel-app must stay listed and can never be targeted).
- `ds:upgrade --consumer <id> [--dry-run|--apply] [--packs-dir d]` — plan or apply a consumer upgrade from the impact manifest. Dry-run (default) prints the dependency diff, migrations, docs anchors, verification commands, and suggested branch without touching files. Apply requires opt-in and a local repository, updates dependencies, installs, runs the consumer's registered verification, and restores the consumer on any failure. Unmanaged forks are refused outright.
- `ds:release [--publish]` — orchestrate release-check → release-impact → pack, write `.release/release-record.json`, and produce dry-run upgrade plans for every opted-in consumer; any failure blocks the release. `--publish` is the only publishing mode and refuses to start without `NODE_AUTH_TOKEN`.
- `agents:generate` / `agents:check` — regenerate or verify the bounded `kernel-ds:generated` inventory sections in AGENTS files; prose outside the markers is never touched (decision 0046).
- `skills:check` — static integrity for `kernel-ds-*` skills: frontmatter, required Verification section, path/script/entity existence, private-path leaks, and trigger-fixture selection.

## Boundaries

- The catalog authoring commands write `packages/catalog/src/entities.ts` through `lib/catalog-file.mjs`; the entity array is strict JSON and must round-trip byte-for-byte (proven by `__check__.mjs`).
- Mutating command tests operate only on temp copies of `__fixtures__/` — never point them at the real catalog in tests.
- npm invocations receive internal constant arguments only; never interpolate user input into shell commands.
- New generation steps append to `generateSteps` in `commands/generate.mjs`; new health checks append to `doctorChecks` in `commands/doctor.mjs`; new verify gates (with `dependents`) append to `verifyGates` in `commands/verify.mjs` and get a row in the `__check__.mjs` selection matrix.
- CI (`.github/workflows/ci.yml`) enforces the same commands: the `automation` job runs `ds:check`/`ds:doctor`/`skills:check`/`agents:check` plus generated-artifact freshness (`ds:generate --skip ds-bundle` then `git diff --exit-code`); the `pack-smoke` job packs real tarballs and imports them from a clean consumer via `pack-smoke.mjs`. Keep workflow steps and these commands in lockstep.

## Verification

```bash
node scripts/ds/__check__.mjs   # deterministic output + exit-code tests
npm run ds:doctor               # must report 0 violations on a clean tree
```

<!-- kernel-ds:generated:start -->
## Generated inventory (do not edit — regenerate with `npm run agents:generate`)

- Root scripts: agents:check, agents:generate, changeset:status, consumers:check, ds:add, ds:changeset, ds:check, ds:doctor, ds:generate, ds:pack, ds:relate, ds:release, ds:tag, ds:upgrade, ds:verify, release:check, release:impact, skills:check
- Generate order: catalog-adapter → ui-package → definitions-package → agents-inventories → ds-bundle
- Verify gates: ds-commands, catalog, ui, definitions, portal, studio
- Doctor checks: catalog-validate, source-files, generated-adapter, ui-api-alignment, a11y-readiness, version-alignment, agents-freshness, skill-integrity, workspace-membership
<!-- kernel-ds:generated:end -->
