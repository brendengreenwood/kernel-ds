# 0073 — Semantic geometry compatibility aliases

Date: 2026-09-27

Status: accepted

Extends: 0072 (semantic geometry levers)

## Context

Decision 0072 established explicit geometry roles for controls, surfaces, floating layers, and blocking overlays. The first reviewed component families adopted those tokens directly, but the portal and package still contained a large migration inventory of generic Tailwind radius utilities.

The portal inventory found 210 radius consumers across 47 files. Most content containers were inline `rounded-lg border bg-card` recipes, while compact furniture commonly used `rounded-sm` or `rounded-md`. Those utilities still resolved through the legacy `--radius` ramp, so changing the semantic levers did not propagate to every existing consumer. This is why the portal page plate could be corrected while many content containers still looked disconnected from the system.

Mechanically rewriting every utility in one pass would assign semantic roles without reviewing component anatomy. Leaving the generic scale attached to the legacy radius would keep known drift in production.

## Decision

The generic Tailwind radius steps are compatibility aliases to semantic geometry roles during migration:

- `--radius-sm` → `var(--radius-control)`
- `--radius-md` → `var(--radius-control)`
- `--radius-lg` → `var(--radius-surface)`
- `--radius-xl` → `var(--radius-modal)`

This gives every existing `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` consumer a controlled system lever immediately. Explicit component contracts should still use the named role token when the role is known, such as `rounded-[var(--radius-control)]` or `rounded-[var(--radius-surface)]`.

`rounded-full` remains the capsule role. Connected regions remain square. Floating primitives must adopt `--radius-floating` explicitly because no generic compatibility step uniquely identifies a floating layer.

The portal's shared `Demo` container uses `--radius-surface` explicitly. The Spacing foundation no longer documents radius; Geometry is the dedicated review surface for all corner roles.

A deterministic `check-geometry-roles.mjs` gate verifies the compatibility aliases, checks the shared Demo and shell seam contracts, and reports the remaining portal inventory by generic step and explicit role use.

## Consequences

- The semantic levers now propagate through existing portal and package consumers instead of only the first explicitly migrated families.
- Generic utilities are accounted compatibility consumers, not unexplained hardcodes.
- The inventory remains visible so component families can migrate to explicit role tokens deliberately.
- Changing `--radius-control`, `--radius-surface`, or `--radius-modal` affects both explicit consumers and their compatibility aliases.
- Floating layers still require family-by-family migration to `--radius-floating`.
- New primitives should choose a semantic role directly rather than relying on a compatibility alias.
