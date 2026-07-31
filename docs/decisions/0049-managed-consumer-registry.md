# 0049 — Managed-consumer registry and verified upgrade propagation

- **Date:** 2026-07-30
- **Status:** accepted

## Decision

Design-system upgrades propagate only to consumers registered in
`scripts/ds/consumers.json` (schema `kernel-ds/consumer-registry@1`), and only
through the `ds:upgrade` command. The registry is strictly opt-in and carries a
policy fence: the decision-0036 `kernel-app` vendored fork must always be
listed as unmanaged, can never be targeted (even when named explicitly), and
enrolling it requires an explicit user amendment.

## Shape

- **Registry entries** declare repository identity (`local` or
  `github:owner/repo`), a repository-relative `localPath` (validated against
  escapes and unmanaged paths), the subscribed publishable packages, a
  branch/base strategy, verification commands restricted to an
  `npm`/`npx`/`node` allowlist, and an explicit `optIn` boolean.
- **`ds:upgrade`** resolves target versions from the release-impact manifest.
  Dry-run (the default, and the only mode available without opt-in, a local
  repository, or credentials) prints the dependency diff, migrations, docs
  anchors, verification commands, and suggested branch without writing
  anything. Apply updates dependencies, installs, runs the consumer's
  registered verification, and restores the consumer byte-for-byte on any
  failure — a failed verification blocks propagation.
- **`ds:release`** orchestrates release-check → release-impact → pack, writes
  `.release/release-record.json`, and generates dry-run upgrade plans for
  every opted-in consumer; any step failing blocks the release. Publishing is
  an explicit `--publish` mode that refuses to start without
  `NODE_AUTH_TOKEN`, keeping the credential-free path fully functional.

## Why

The plan requires managed-consumer upgrade guidance without ever touching
unregistered repositories or the experimental fork. Centralizing the target
list in a typed, validated registry makes "who receives upgrades" reviewable
in one file, while the allowlist and restore-on-failure semantics keep an
automated upgrade from ever leaving a consumer broken or executing arbitrary
registry-supplied commands.

## Proof

`scripts/ds/__check__.mjs` covers registry validation (schema, duplicate ids,
path escapes, fork targeting, command allowlist), the dry-run plan surface,
no-op detection, the refusal matrix (unmanaged fork, unknown id, missing
opt-in, missing credentials), apply success, and verification-failure
restore. The live upgrade proof
(`.mastracode/plans/kernel-ds-productionization.proof/scripts/upgrade-demo.mjs`)
installs version A tarballs, plans with the real manifest, packs version B,
applies through `ds:upgrade --apply`, and records `upgrade.txt` ending
`PROOF: GREEN`.
