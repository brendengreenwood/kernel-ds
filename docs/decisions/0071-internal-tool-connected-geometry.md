# 0071 — Internal-tool connected geometry

Date: 2026-09-26
Status: accepted
Supersedes in part: 0065 (the single softened radius cascading through every surface and control)
Extends: 0010 (control metrics), 0057 (composition level ladder), 0070 (prototype discovery and promotion authority)

## Context

Decision 0065 promoted a 14px base radius across cards, inputs, popovers, and buttons. That direction helped establish the raised-plate visual model, but dense workspace composition exposed a weakness: controls and adjacent navigator, canvas, dock, and toolbar regions each read as separate soft cards instead of parts of one internal tool.

A Figma study compared the existing geometry against the selected App shell and then placed 4px, 6px, 8px, and 12px Buttons at a 12px inset from identical 8px surface corners. The 4px control retained a clear affordance without competing with the surface perimeter. A connected shell with square interior seams read as one work surface rather than a collection of upholstered cards.

## Decision

**Kernel uses separate geometry roles instead of one radius cascading through every layer: 4px controls, 8px exposed work-surface perimeters, and square seams between connected regions.**

- `--radius-control` is `0.25rem` and is the canonical Button radius across all sizes and icon variants.
- `--radius-surface` is `0.5rem` and `--panel-radius` aliases it for connected work surfaces and standalone panel furniture.
- `--radius` remains `0.875rem` temporarily for existing cards and floating layers. This preserves compatibility while those components are reviewed by role instead of being changed indiscriminately.
- `PanelShell` owns the single rounded perimeter and clipping boundary.
- `PanelGroup` arranges horizontal or vertical connected regions and supplies shared divider seams.
- `PanelRegion` is square by definition. Navigator, canvas, dock, and toolbar regions do not add independent corner radii inside the shell.
- Connected-panel geometry belongs to `@kernel/ui`; product-specific `data-v2-*` selectors are not the canonical contract.

## Consequences

- Buttons become visually subordinate to the surfaces that contain them and match the approved Figma candidate.
- Workspace chrome can express the App-shell composition without copying prototype-only selectors.
- Large Tiles, small Tiles, TableFrame, and IconChip use explicit surface or control geometry rather than inheriting the legacy 14px radius.
- The old concentric `panel radius − panel inset` formula is retired for connected work surfaces. Insets remain spacing decisions, not inputs to corner-radius arithmetic.
- Cards, popovers, dialogs, inputs, selects, toggles, and other primitives are not automatically changed by this decision. Each must be reviewed against its role before moving from the legacy radius.
- The Figma Button visual concern may return to `validated` after canonical code and browser verification, but registry promotion still requires the acceptance artifact and immutable commit evidence defined by decision 0070.
