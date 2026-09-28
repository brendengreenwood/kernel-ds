# 0081 — Allow reviewed inherited variant axes in Figma contracts

**Status:** Accepted (2026-09-28)

## Context

The component contract generator extracts variant axes from `cva` declarations in each component's own source file. `ToggleGroup` instead imports `toggleVariants` from `Toggle` and receives its selection type from Base UI props, so its public `Type`, `Variant`, and `Size` axes were absent from the generated contract even though they are exposed by the code API. The live audit correctly rejected the corresponding Figma component set as undocumented.

## Decision

Reviewed component overrides may declare `inheritedVariantAxes` when a public axis is supplied by an imported variant definition or upstream primitive rather than declared locally.

- Every inherited axis must have a non-empty, unique list of non-empty string values.
- An inherited axis may not duplicate an axis extracted from the component's local source.
- The generator merges inherited axes into the generated strict `variantAxes` contract; `inheritedVariantAxes` is input metadata and is not emitted as a separate contract field.
- This mechanism does not create Figma-only design states. Those remain under `designStateAxes` per decision 0080.

## Consequences

- `component.toggle-group` records `Type=single|multiple`, `Variant=default|outline`, and `Size=sm|default|lg` without changing the React API or weakening live audit.
- Invalid or duplicate inherited axes fail contract generation with targeted errors.
- Cross-file public variant inheritance remains explicit and reviewable rather than requiring broad source-graph inference in the generator.
