# 0039 — CI gate enforcement + AI review layer

Date: 2026-07-27
Status: accepted

## Context

The repo had accumulated a real verification discipline — the portal's gate
scripts (parity, coverage, prose-quality, style-fidelity, status-map,
composition, plus the `__check__` runtime assertions) and the studio's vitest
suite — but none of it was *enforced*. The only CI workflow (`.github/workflows/ci.yml`)
ran four steps for the portal (`npm ci`, `tsc -b`, `build`, `lint`) and nothing
for the studio package at all. Every other gate only ran when a human remembered
to run it locally.

That left two gaps:

- **Deterministic checks weren't blocking merges.** A PR that broke doc-entity
  parity, introduced overline drift, or failed a studio test would go green in
  CI because CI never ran those checks. Decision 0037 even flagged "wiring the
  guard into CI" as a deliberate follow-up — this closes it.
- **No review judgment layer.** CI can only answer pass/fail. Nothing offered an
  opinion on a diff's correctness, naming, or design coherence.

## Decision

**Run the full canonical gate list in CI, add the missing studio job, and layer
CodeRabbit on top for AI review — with the two responsibilities kept separate.**

- **CI (`.github/workflows/ci.yml`) is the deterministic gate.** Two jobs:
  - `portal` — `npm ci` → `build` (tsc -b && vite build) → `lint` (oxlint) →
    the canonical gate sequence in the order documented in
    `kernel-portal/AGENTS.md`: `check-component-docs` (parity), `--coverage`,
    `check-prose-quality`, `check-style-fidelity`, `check-status-map`,
    `emit-composition`, then the three runtime assertions (`__check__.mts` ×2 via
    `--experimental-strip-types`, marks `__check__.mjs`).
  - `studio` — `npm run check` (tsc --noEmit) → `npm test` (vitest run). This
    package had *no* CI coverage before.
  - Node bumped `22` → `24`. The `.mts` gate scripts run under
    `node --experimental-strip-types`, which is a Node 24 baseline; pinning 22
    would have failed those steps.
  - `contrast-audit` and `mobile-audit` are intentionally *not* in CI — they
    require a running URL and stay local/manual.

- **CodeRabbit (`.coderabbit.yaml`) is the judgment layer.** It reviews every PR
  for correctness and convention adherence, reading the per-directory AGENTS.md
  conventions via `path_instructions` (ui primitives, doc-entities, objects,
  mastra tools). It explicitly defers deterministic checks to CI, and filters out
  `ds-bundle/**`, `dist/**`, and `**/*.md` to keep review focused on source.

## The separation principle

Same source-of-truth discipline as 0035–0037, applied to enforcement: **CI
answers "does it pass the gates," CodeRabbit answers "is it good."** Neither
duplicates the other. The gate *definitions* live in one place (the scripts +
AGENTS.md ordering); CI just runs them, so there's no second copy of the gate
list to drift.

## Verification

Every CI step was run locally, job-for-job, before the workflow was committed —
proof rather than assumption:

- Portal gates: parity 69/0, coverage 69/0, prose-quality exit 0, style-fidelity
  0/0, status-map exit 0, composition EMIT-OK, all three `__check__` assertions
  pass.
- Studio: tsc --noEmit clean, vitest 109/109 pass.
- Both YAML files: no tabs, valid structure.

## Deliberately deferred

- **Branch protection.** Requiring the `portal` and `studio` checks before merge
  is a GitHub repo-settings action, not a file in the tree. Until it's set, CI
  reports but does not block.
- **CodeRabbit app install.** `.coderabbit.yaml` only activates once the
  CodeRabbit GitHub App is installed on the repo — also a GitHub-side action.
- **ds-bundle in CI.** No portal gate or studio test reads the generated bundle
  (gates read source `.tsx`; studio tests are self-contained), so CI does not
  build it. If a future gate depends on the bundle, add a build step.
