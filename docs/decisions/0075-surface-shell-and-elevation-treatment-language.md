# 0075 — Surface shells replace plate architecture language

Date: 2026-09-27
Status: accepted
Extends: 0065, 0066, 0071, 0072, 0073, 0074

## Context

The earlier elevation work used “plate” as a compact visual model for several concerns at once: fill, perimeter edge, top lip, cast shadow, corner radius, and separation from the canvas. Decision 0066 applied that model to the inset application shell, and `--elev-plate` carried the raised fill used by nested panel furniture.

That model was useful during discovery, but the current system now assigns those concerns independently. Semantic geometry roles choose corner treatment. Connected composition assigns perimeter ownership and square seams. Elevation chooses border, fill, lip, and shadow independently. `PanelShell`, `PanelGroup`, and `PanelRegion` make container ownership explicit.

Continuing to call the current architecture a plate system hides those distinctions and suggests that one bundled recipe should govern every container.

## Decision

Current architecture uses **surface shell** and **elevation treatment** terminology:

- A **surface shell** owns an exposed perimeter, including its semantic radius, border, clipping, and any cast shadow.
- **Connected regions** remain square and do not recreate the shell perimeter.
- **Raised-surface treatment** means the low-level nested-furniture recipe: a fill one step off the parent plus an optional top lip, without another cast shadow.
- The raised fill token is `--elev-raised-surface`; the implementation constant is `RAISED_SURFACE`.
- The portal’s inset main region is described as a page surface shell, not as the page plate.
- “Page plate” remains valid only when referring to decision 0066 or other historical records that explain how the current model evolved.

The semantic geometry contract remains unchanged: controls use 4px; surfaces, floating layers, and modals use 8px; connected seams use 0px; capsules use the full-radius role.

## Consequences

- Active code comments and component documentation describe ownership and treatments directly instead of relying on plate shorthand.
- Existing immutable decisions and historical audit records retain their original terminology.
- `--elev-edge-page` is removed because the page surface now owns a real `border-border` perimeter.
- `--elev-raised-surface` remains a low-level elevation token, not a container taxonomy or a signal that nested furniture should receive an additional cast shadow.
- Future components should state whether they are a shell, a connected region, or nested raised furniture before choosing geometry or elevation.
