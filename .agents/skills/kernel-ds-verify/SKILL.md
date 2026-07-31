---
name: kernel-ds-verify
description: Run the focused design-system verification gates selected from changed paths, or the full matrix before shipping. Use to verify DS changes, run gates, or reproduce CI locally.
triggers: verify the change, run gates, focused checks, reproduce ci, verification matrix
user-invocable: true
---

# Kernel DS — verify a change

## When to use

Any design-system change that needs gating — before commit, before PR, or reproducing CI.

## Workflow

1. `npm run ds:verify` — selects gates from changed paths (ds-commands, catalog, ui, definitions, portal, studio). Add `--all` for the full matrix or `--base <ref>` to include committed changes.
2. `npm run ds:doctor` — repository health: catalog validity, generated freshness, API alignment, a11y readiness, versions, workspace membership.
3. Generated artifacts must be fresh: `npm run ds:generate` then a clean `git diff` proves it; `npm run agents:check` covers AGENTS inventories.
4. Browser-level verification (mobile/contrast audits, light+dark screenshots) delegates to the `kernel-verify` skill.

## Verification

- `npm run ds:verify` exits 0 with `DS-VERIFY-OK`.
- `npm run ds:doctor` exits 0 with `DS-DOCTOR-OK`.
- `npm run skills:check` and `npm run agents:check` stay green when guidance changed.
