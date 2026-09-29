# 0080 — Separate code-public contracts from reviewed Figma design states

**Status:** Accepted (2026-09-27)

## Context

Live audit of the baseline Figma families found variant axes and instance
properties (`State`, `Label`, `Icon`) that do not exist in the extracted code
contract. Strict code parity would force rebuilding accessible design-state
coverage out of the library; treating them as public contract would silently
expand the React API.

## Decision

The durable component contract keeps two separated layers:

- Extracted `variantAxes`, `publicProperties`, and literal `data-slot` slots
  remain the strict code-public contract. Unknown axes, values, properties, or
  slots fail generation and live audit.
- Reviewed overrides may add `designStateAxes` (Figma-only interaction
  evidence such as default/hover/focus/disabled) and `figmaProperties`
  (instance-authoring controls with a declared Figma property type and an
  explicit mapping to code content or composition). These are audited
  separately and are never presented as React props or code-public variants.
- Figma anatomy must carry machine-readable `kernel.dsds`/`dataSlot` metadata
  matching the extracted code slots; layer names are not evidence.
- The accessibility checklist derives from the contract. Static evidence can
  support target-size, focus-variant, and non-color-differentiation checks;
  accessible name/role proof is deferred to the portal runtime proof and is
  recorded as reason-coded `notApplicable` in static audits.

## Consequences

- `docs/figma/component-contract-overrides.json` is the reviewed authority for
  design states and Figma properties; the generator validates every entry
  against the extracted contract.
- The live audit compares real Figma property definitions, variant axes,
  anatomy slot metadata, and required semantic token roles against the
  contract and fails with targeted mismatch codes.
- Recorded as a plan amendment ("Separate design states") in the
  full-kernel-ui-figma-integration plan set.
