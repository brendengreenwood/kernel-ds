# 0015 — Mobile documentation-portal patterns; the sequential pager

Date: 2026-07-05 · Status: accepted

## Context

Per-page IA (decision 0011) made every rail item its own page — great on
desktop, but on a phone the portal read like a stack of disconnected pages.
The rail is behind a hamburger, so moving between pages meant open drawer →
scan → tap, every time. The portal needs to behave like a **mobile
documentation reader**, where you can move through the material without the
rail. The component pages already had a local prev/next; the owner asked to
make that a portal-wide pattern.

## Decision

**Establish a set of mobile documentation-portal patterns; the first and
load-bearing one is a global sequential prev/next pager at the foot of every
page.**

- **One reading order, one source.** `src/lib/page-order.ts` (`docOrder`)
  is the linear sequence — the same order as the rail — with the component
  pages slotted in right after the Components index. `neighbors(path)`
  returns the prev/next for any page.
- **`<DocPager>`** renders at the bottom of every page (mounted once in
  `PortalLayout`, after the `<Outlet/>`). Mobile-first: full-width cards
  stacked (`grid-cols-1`), side-by-side from `sm`; ≥56px tall thumb
  targets; Overline labels from `typeStyles` (dogfooding, decision 0014);
  truncating titles; directional chevrons. The old per-component local
  pager is removed — the global one supersedes it and flows the component
  sequence into and out of the surrounding sections.
- **Both surfaces.** The preview mirrors it: a `#doc-pager` element that
  `portal.js` populates from the rail order on each hash route, styled by
  `.doc-pager`/`.dp-card` in `portal.css` (same mobile-first grid).

## Consequences

- The whole portal is now walkable linearly on a phone — thumb-reachable,
  always present, no drawer round-trip.
- Adding a page = adding it to `docOrder` (and the rail); the pager updates
  everywhere.
- This opens the mobile-doc-pattern area. Candidates next (not yet built):
  an "On this page" jump for long pages, a compact-on-scroll header, a
  bottom tab bar for top-level areas, swipe-to-page. Each is its own task.

## Notes

The pager order deliberately matches the rail, so "Next" always means "the
next thing in the rail" — consistent with how the rail teaches the system
top to bottom.
