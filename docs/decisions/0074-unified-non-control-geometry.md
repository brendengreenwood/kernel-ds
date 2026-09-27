# 0074 — Unified non-control geometry

Date: 2026-09-27

Status: accepted

Extends: 0072 (semantic geometry levers) and 0073 (semantic geometry compatibility aliases)

## Context

The semantic geometry model separated work surfaces, floating layers, and blocking overlays so each family could be tuned independently. The first review used 8px for surfaces and floating layers but 12px for modals.

Reviewing those roles together on the Geometry foundation page showed that the extra modal rounding did not add useful hierarchy. It reintroduced the softer, more upholstered appearance that the internal-tool geometry work was intended to remove. Modal hierarchy should come from placement, backdrop, elevation, and interaction modality rather than a larger corner radius.

The roles remain semantically distinct because they describe different component families and may need independent behavior later. Their canonical values do not need to differ when the same geometry is appropriate.

## Decision

Kernel uses two canonical radius values across the primary geometry roles:

- `--radius-control: 0.25rem` (4px) for interactive controls.
- `--radius-surface: 0.5rem` (8px) for exposed work-surface perimeters.
- `--radius-floating: 0.5rem` (8px) for floating layers.
- `--radius-modal: 0.5rem` (8px) for blocking dialogs and overlays.
- `0px` for connected interior seams.
- full/capsule geometry only for semantically pill-shaped objects.

Surface, floating, and modal remain separate tokens even though all three resolve to 8px. Components continue to select the role that describes their behavior rather than sharing an undifferentiated token.

The `/geometry` foundation page presents 8px as the canonical default for all three non-control roles. `check-geometry-roles.mjs` verifies the values as well as the compatibility aliases.

## Consequences

- Dialogs no longer become visually softer than the work surfaces behind them.
- Surface, floating, and modal families can still diverge later through an explicit decision without reclassifying consumers.
- `rounded-xl`, which maps through the modal compatibility alias, now resolves to 8px.
- Modal hierarchy depends on backdrop, elevation, layout, and blocking behavior rather than extra rounding.
- Figma role variables should mirror the unified 8px values during the next reviewed synchronization slice.
