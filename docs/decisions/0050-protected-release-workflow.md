# 0050 — Protected manual release workflow

- **Date:** 2026-07-30
- **Status:** accepted

## Decision

Publication to private GitHub Packages runs only through
`.github/workflows/release.yml`, a manual-only (`workflow_dispatch`)
workflow with two modes:

- **dry-run (default):** changeset status, `release:check` (metadata policy,
  publishable config, temp-worktree version dry run), `release:impact`, and
  `ds:pack` — entirely credential-free, with the impact manifest and packed
  tarballs attached as run artifacts.
- **publish:** explicit opt-in, restricted to `main`, protected by the
  `release` GitHub environment, and refused unless the
  `KERNEL_DS_PUBLISH_TOKEN` secret is configured. The job re-runs every
  release gate on the exact commit being published — DS self-tests, doctor,
  release checks, both package builds/tests/contracts, catalog integrity,
  portal build + lint, Studio typecheck + tests, and the packed-consumer
  smoke — before `changeset publish`. `NODE_AUTH_TOKEN` exists only in that
  step's env, sourced from the secret.

## Why

The plan requires that no package version is published unless
packed-consumer, catalog parity, package API, portal, and Studio gates pass,
and that dry-run paths work without credentials while live publish waits for
configured secrets. Encoding the gates in the publish job itself (rather
than trusting a prior CI run) means publication can never happen from an
unverified commit, and the missing-secret refusal keeps the workflow safe to
merge before any registry/org mapping exists.

## Enforcement

`scripts/ds/__check__.mjs` statically validates the workflow: manual-only
trigger, credential-free dry-run job, publish gated to explicit mode + main
+ protected environment, token only from the configured secret, no literal
tokens, and every named gate ordered before `changeset publish`. Rollback,
yank/deprecation, and partial-publish recovery live in
`docs/release-runbook.md`.
