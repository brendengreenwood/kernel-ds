# 0076 — Jev-assisted DSDS reconciliation

Date: 2026-09-27 · Status: accepted

## Context

The active product need is the agent-assisted Figma → code → Figma reconciliation pipeline, not the experimental Kernel Studio server. The repository already has deterministic identity, prototype-lifecycle, generation, verification, and promotion machinery, but identity resolution, artifact-role classification, concern classification, and sync-direction recommendations were being made informally during agent sessions.

That informality allowed a component-light Figma workspace sketch to be described too quickly as a visual candidate. The later audit showed that it was still an exploration and that the reusable Figma layer was incomplete. A probabilistic judgment step can make those ambiguous decisions explicit, typed, and reviewable, but it must not become an authority that silently changes either surface.

## Decision

Add a repository-level `ds:reconcile` command as the bounded judgment step in the DSDS reconciliation loop.

The command accepts an inspected evidence document containing one artifact, 1–12 catalog-backed identity candidates, concrete observations, and authority constraints. It asks TypeSafe's Jev model independent typed questions for:

- semantic catalog identity, including an explicit `unmapped` outcome;
- current artifact role;
- independently material visual, contract, data, composition, and workflow concerns;
- one next sync direction;
- evidence sufficiency and whether human review is required.

The command writes a versioned reconciliation report. Every report is authorization-gated with `status: human-review-required` and `mutationsAllowed: false`. Jev may recommend work, but it cannot edit Figma, code, catalog identity, or prototype lifecycle state. Any mutation remains a separate, explicitly authorized, single-direction action followed by the existing deterministic verification gates.

`--dry-run` exposes the exact request without credentials or writes. `--response-file` supports deterministic tests and review replays without a live API call. Live execution reads `TYPESAFE_API_KEY` only from the process environment.

## Consequences

- The Figma/code reconciliation pipeline gains a reviewable probabilistic judgment layer without making Kernel Studio a dependency.
- Typed output guarantees the report interface, not the truth of the recommendation; evidence quality and human review remain decisive.
- Identity and direction ambiguity become visible through probability distributions and explicit blockers rather than being hidden in prose.
- Catalog validation, prototype transitions, accessibility checks, builds, and generated-artifact freshness remain deterministic and authoritative.
- The command intentionally stops before mutation. Future automation may consume an approved report, but it must preserve the one-direction-at-a-time and explicit-authorization boundaries.
