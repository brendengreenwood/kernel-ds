# 0077 — Figma authoring requires page-level canvas placement

Date: 2026-09-27 · Status: accepted

## Context

Figma component authoring had been treating each new section or component family as an isolated operation. Coordinates were chosen from whatever appeared open at the time, and component-set arrangement was considered complete once the variants themselves formed a clean matrix.

That approach produced a disorderly Components page: related sections landed far apart, wrappers changed size without neighboring sections being reflowed, remembered coordinates became stale, and targeted screenshots hid page-level overlap and reading-order problems. A well-arranged component set is not a well-arranged design-system page if its surrounding section is misplaced.

## Decision

Canvas placement is part of the authored Figma result.

Before creating, rebuilding, or arranging a reusable artifact, the Figma agent must:

1. capture the target page and inventory the bounds of every top-level section or frame;
2. choose the destination according to the page's existing reading order and component-family grouping;
3. calculate placement from occupied bounds using the page's established grid and section spacing, never from an arbitrary open-looking coordinate or a coordinate remembered from an earlier call;
4. keep related component families inside one clearly named section;
5. after any operation that can change bounds or node identity, re-resolve the resulting nodes, measure their final wrappers, and reflow neighboring top-level sections;
6. verify both the edited section and the complete page with screenshots before considering the write finished.

A Figma authoring operation is incomplete while sections overlap, drift into disconnected canvas islands, break the page reading order, or depend on stale coordinates.

This rule applies especially to component-set arrangement because combining variants can recreate the set, change node IDs, and expand wrapper bounds.

## Consequences

- Component creation and component arrangement require a page-level preflight and post-write reflow, not only local visual verification.
- Full-page screenshots become required evidence for reusable Figma authoring work.
- Existing disorder on the Components page should be corrected with an explicit layout cleanup pass before more component families are added.
- The DSDS handoff and Figma arrangement skill encode the same rule so it survives across agent sessions.
- Placement changes do not alter component identity, canonical ownership, or lifecycle state; they improve the legibility and maintainability of the Figma library itself.
