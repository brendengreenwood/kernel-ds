# 0086 — Labels are regular weight

Date: 2026-10-08
Status: accepted

## Context

Dense tools put many labeled fields on one surface. At medium weight, `Label` competed with the values it describes. The origination-map v2 pricing panel patched labels to regular locally. Separately, Segoe UI text read slightly low in `Input` and `Select` triggers.

## Decision

- `Label` is regular weight (`font-normal`). Values carry the weight, labels don't. Emphasis in a form comes from titles (`text-overline`) and values, not labels.
- `Input` and `Select` triggers set their text 1px higher (same control height) so it reads optically centered.

## Consequences

- Every label in every consumer gets lighter; no per-app override needed.
- Apps that want a heavier label in a specific place opt in with a class, not a new variant.
- Prototype copies of both fixes are removed (origination-map v2 `PATCHES.md` #5, #6).
