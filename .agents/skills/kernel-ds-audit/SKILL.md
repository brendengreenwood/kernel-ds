---
name: kernel-ds-audit
description: Audit design-system health — doctor diagnostics, catalog integrity, generated-artifact freshness, skill and AGENTS drift. Use for health checks, drift detection, or an audit of the system.
triggers: audit, doctor, health check, drift, stale inventory
user-invocable: true
---

# Kernel DS — audit system health

## When to use

Periodic health checks, suspected drift, or before starting significant work on the system.

## Workflow

1. `npm run ds:doctor` — the aggregate report: catalog validity, missing sources, stale generated adapter, `@kernel/ui` API alignment, a11y readiness, version alignment, workspace membership, AGENTS/skill freshness.
2. `npm run catalog:check` — deep catalog integrity plus the portal lifecycle adapter.
3. `npm run agents:check` and `npm run skills:check` — generated inventory sections and skill integrity.
4. Freshness proof for generated artifacts: `npm run ds:generate` then `git diff` must be clean (ds-bundle is untracked; the adapter, api.json files, and AGENTS sections are tracked).
5. Accessibility posture: doctor flags ready entities without review; browser-level contrast/mobile audits delegate to the `kernel-verify` skill.

## Verification

- `npm run ds:doctor` exits 0 with `DS-DOCTOR-OK` on a healthy tree; every violation it prints is actionable and cites the fixing command.
