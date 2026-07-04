# 0011 — Every side-rail item is its own page

Date: 2026-07-04 · Status: accepted

## Context

Both surfaces were single scrolling documents: the whole system lived on
one page, the rail was a scrollspy, and deep links were `#anchor` jumps.
As the pattern library and component set grew this got unwieldy —
long scrolls, no per-thing URL to share, and the rail's job (locate one
thing) fought the page's job (show everything). The owner's ask:
"give each item on the side rail its own page."

## Decision

**Each rail destination is a route (portal) / a hash-routed page
(preview). Only one section renders at a time.**

- **Portal** (`kernel-portal/`): React Router nested routes under a
  `PortalLayout` (sidebar + header + `<Outlet/>`). One route per section
  (`/colors`, `/forms`, `/modals`, …). The single-page `pages/portal.tsx`
  and the aggregate `gallery.tsx` are gone.
- **Components get real drill-down.** The old one-big-gallery is carved
  into per-cluster demo components (`galleryClusters` registry, keyed by
  slug), an index at `/components`, and a page per cluster at
  `/components/:slug` with member pills and prev/next paging. A "cluster"
  is one demo group (e.g. *Input · Select · Textarea*), preserving how
  related components were always demoed together.
- **Preview** (`Kernel Design System.html`): a ~40-line hash router in
  `portal.js` toggles a single `.section.is-active`; sub-anchors
  (`#c-input`, `#fe-selection`) resolve to their containing section and
  scroll to the element. Section-hiding is gated on a `.js` class set
  before first paint, so a no-JS load still renders everything stacked.
- **Old links keep working.** Section slugs reuse the former anchor ids;
  a `routeForAnchor()` helper + a `LegacyHashRedirect` translate a
  bookmarked `/#colors` or `/#c-button` to its route on load.

## Consequences

- Every section and every component has a shareable URL; the rail is now
  navigation, not a scroll cue.
- The two surfaces mirror at the **rail level** (same destinations →
  same pages). The portal additionally offers per-component pages under
  `/components/:slug`; the preview's rail has no per-component entries, so
  its Components page stays a single page (as its rail always did) — this
  asymmetry is intentional, not drift.
- Adding a component = adding its cluster to one gallery file's exported
  list (the registry and both nav surfaces read from it). Adding a
  section = one route + one rail entry on each surface.
- Netlify already ships an SPA redirect (`netlify.toml`), so deep links
  resolve on hard load.
