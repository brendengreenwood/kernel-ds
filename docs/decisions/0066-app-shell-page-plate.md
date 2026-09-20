# 0066 — The app shell floats the page plate

Date: 2026-08-06
Status: accepted
Extends: 0065 (v2 surface direction), 0053 (elevation ramp per-theme alpha)

## Context

The v2 prototype's most visible move is its shell composition: the whole
viewport reads as the sidebar's surface, and the page content floats on it as
a rounded plate with a hairline edge, a highlight lip, and the 2xl cast. The
promotion (decisions 0064–0065) landed the tokens that make the plate possible
(`--elev-edge-page`, `--elev-lip`, the per-theme shadow ramp) but the
composition itself still lived only in the prototype's app-layer CSS. The
portal — the one shipped surface — still welded its content to the rail on the
lowest shadow rung.

## Decision

**1. The plate lives in the DS's inset variant, not in app CSS.**
`SidebarInset` is the seam the DS already provides for this composition. Its
inset treatment now carries the plate at source: `m-4` on every side, the
`--elev-edge-page` hairline plus `--elev-lip` top highlight as inset shadows,
and `shadow-2xl` — the only rung whose geometry must wrap a corner (decision
0053). Scoped `≥48rem` so mobile stays full-bleed. Consumers opt in with
`variant="inset"`; nothing changes for the default variant.

**2. The portal adopts it.** The portal's rail takes `variant="inset"`, so the
canvas reads as sidebar color and the doc content floats as the plate. The rail
keeps `offcanvas` collapse rather than the icon rail: the portal's navigation
is text links, and an icon rail would collapse them to empty buttons. The
sticky header takes `md:rounded-t-xl` so its translucent backdrop does not
square off the plate's top corners.

## Consequences

- Any app composing `Sidebar variant="inset"` + `SidebarInset` gets the v2
  shell for free — the prototype's rule no longer needs to be copied.
- The plate's edge and lip ride the `--elev-*` tokens, so both themes stay in
  tune with the elevation model without per-app tuning.
- The portal and the prototype now share one shell recipe; the prototype's
  `v2-layer.css` page-plate rule becomes dedupe material for the register
  drain.
