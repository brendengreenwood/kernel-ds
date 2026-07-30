# DS lifecycle commands

`scripts/ds/` implements the Kernel DS lifecycle CLI: AUTHOR → GENERATE → VERIFY → RELEASE → PROPAGATE. Every command is noninteractive and flag-driven so agents and CI can run them deterministically. Invoke through the root scripts (`npm run ds:<command>`), never by re-deriving the underlying steps.

## Commands

- `ds:add --kind <kind> --name <name> [--slug s] [--package p] [--docs-dir d]` — scaffold a catalog entity plus optional docs skeleton. Refuses existing ids/files; never overwrites.
- `ds:tag --entity <id> --tag <tag> [--remove]` — add/remove a closed-taxonomy tag; validates before writing.
- `ds:relate --entity <id> --type <type> --target <id>` — record a typed relationship; validates type and target existence first.
- `ds:generate [--list|--only ids|--skip ids]` — run generation in declared order: catalog-adapter → ui-package → definitions-package → agents-inventories → ds-bundle.
- `ds:verify [--all|--base <ref>]` — select and run the focused gates implied by changed paths.
- `ds:doctor [--fixture <dir>]` — report catalog, generated-artifact, API-alignment, a11y-readiness, version, and workspace violations; nonzero when actionable.
- `ds:changeset --package <name> --bump <patch|minor|major> --summary <text>` — write a Changesets-format note with a content-hashed filename (release execution lands later).
- `ds:pack [--package name] [--write --out dir]` — build + pack the distributable packages and verify the pack payload allowlist.
- `agents:generate` / `agents:check` — regenerate or verify the bounded `kernel-ds:generated` inventory sections in AGENTS files; prose outside the markers is never touched (decision 0046).
- `skills:check` — static integrity for `kernel-ds-*` skills: frontmatter, required Verification section, path/script/entity existence, private-path leaks, and trigger-fixture selection.

## Boundaries

- The catalog authoring commands write `packages/catalog/src/entities.ts` through `lib/catalog-file.mjs`; the entity array is strict JSON and must round-trip byte-for-byte (proven by `__check__.mjs`).
- Mutating command tests operate only on temp copies of `__fixtures__/` — never point them at the real catalog in tests.
- npm invocations receive internal constant arguments only; never interpolate user input into shell commands.
- New generation steps append to `generateSteps` in `commands/generate.mjs`; new health checks append to `doctorChecks` in `commands/doctor.mjs`.

## Verification

```bash
node scripts/ds/__check__.mjs   # deterministic output + exit-code tests
npm run ds:doctor               # must report 0 violations on a clean tree
```

<!-- kernel-ds:generated:start -->
## Generated inventory (do not edit — regenerate with `npm run agents:generate`)

- Root scripts: agents:check, agents:generate, ds:add, ds:changeset, ds:check, ds:doctor, ds:generate, ds:pack, ds:relate, ds:tag, ds:verify, skills:check
- Generate order: catalog-adapter → ui-package → definitions-package → agents-inventories → ds-bundle
- Verify gates: ds-commands, catalog, ui, definitions, portal, studio
- Doctor checks: catalog-validate, source-files, generated-adapter, ui-api-alignment, a11y-readiness, version-alignment, agents-freshness, skill-integrity, workspace-membership
<!-- kernel-ds:generated:end -->
