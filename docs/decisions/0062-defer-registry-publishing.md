# 0062 — Defer registry publishing until an external consumer exists

- Date: 2026-07-30
- Status: accepted
- Renumbered from 0053 (2026-08-05): the taxonomy track and main both minted 0053; main's kept the number.

## Context

The release pipeline for `@kernel/ui` and `@kernel/definitions` is fully built and proven:
Changesets metadata (decision 0048), dry-run versioning in a temp worktree, `ds:pack`
payload checks, pack-smoke consumer install, managed-consumer upgrade plans (decision
0049), and a gated publish workflow with a protected `release` environment (decision
0050). Everything up to the actual `npm publish` runs green without credentials.

Live publishing, however, has zero consumers today. Portal and Studio consume the
packages via `file:` workspace dependencies; `kernel-app` is a fenced vendored fork
excluded from managed upgrades (decision 0036). Publishing now would create a
maintenance surface nobody installs from.

There is also an external blocker: GitHub Packages requires the package scope to match
the repository owner. The repo lives under the `brendengreenwood` user account while
the packages are scoped `@kernel`, so the publish job cannot succeed as configured
without an account-level change.

## Options

1. Create a `kernel` GitHub org and move (or mirror) the repo there — keeps the
   `@kernel` scope; cleanest long-term home.
2. Rescope the packages to `@brendengreenwood/*` — publishable today, but touches every
   import, the catalog, and consumer registry entries.
3. Publish to npmjs.com under an `@kernel` npm scope (if available) — public, or paid
   for private packages.

## Decision

Defer live registry publishing until a second consumer project outside this monorepo
actually needs to install the packages. No code changes are required in the meantime;
the dry-run release path remains the enforced CI gate.

When unblocked, the remaining steps are:

1. Pick a home for the packages (one of the three options above).
2. Add the `KERNEL_DS_PUBLISH_TOKEN` secret to the `release` environment.
3. Run the release workflow in `publish` mode from `main`.

## Consequences

- Consumers inside the monorepo keep using `file:` deps; nothing changes day to day.
- The open question is tracked in STATE.md so it resurfaces when a new consumer appears
  instead of being rediscovered from a failed publish run.
- If the scope decision lands on option 2, a follow-up decision must supersede this one
  and cover the rename blast radius.
