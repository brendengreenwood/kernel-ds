# 0047 — CI enforces the DS automation gates

Date: 2026-07-30
Status: accepted

## Decision

CI runs the DS lifecycle commands as first-class jobs instead of trusting local ritual:

- `automation` job: `ds:check` (command self-tests including the verify selection matrix), `ds:doctor`, `skills:check`, `agents:check`, then generated-artifact freshness — `ds:generate --skip ds-bundle` followed by `git diff --exit-code`. The ds-bundle step is skipped only because the bundle is gitignored; the studio job still builds it fresh every run.
- `definitions-package` job: build + tests + package contract for `@kernel/definitions`, mirroring the existing `ui-package` job.
- `pack-smoke` job: `ds:pack --write` produces the real tarballs, which are installed into a clean throwaway consumer (peer React supplied by the consumer) and imported through `scripts/ds/pack-smoke.mjs` — the packed payload must resolve and parse outside the workspace.
- Portal and Studio jobs are unchanged and stay legible as separate jobs.

`ds:verify` selection now expands through per-gate `dependents` (catalog/ui/definitions → portal + studio; portal → studio), so a package change never silently skips its consumers. The selection logic is pure (`selectGates`) and covered by a changed-path matrix in `scripts/ds/__check__.mjs`.

## Why

Segment 4 introduced deterministic lifecycle commands and generated guidance; without CI enforcement they would drift the same way hand-maintained registries did. Correctness comes before change-aware optimization: every job runs on every PR, and the transitive-dependents expansion exists so the local `ds:verify` shortcut is also safe.

## Consequences

- Generated artifacts (portal adapter, package entry points, api.json, AGENTS inventories) cannot merge stale.
- Pack payload regressions (leaked files, broken exports, missing peer setup) fail PRs before publication exists.
- New verify gates must declare `dependents` and add a selection-matrix row.
