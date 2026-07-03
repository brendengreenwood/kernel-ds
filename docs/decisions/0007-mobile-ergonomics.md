# 0007 — Mobile ergonomics: drawer nav, 16px input floor, 44px touch targets

Date: 2026-07-03 · Status: accepted

## Context

A 390×844 audit of both surfaces found the system technically overflow-free
(the 2026-07-03 pass held) but not actually *usable* on a phone:

- The static preview's sidebar was `display: none` below 880px with no
  replacement — the site had no navigation at all on phones.
- Every preview form control rendered at 12.5–15px; iOS Safari zooms the
  page when focusing any text control under 16px. The real build already
  avoided this via shadcn's `text-base md:text-sm` idiom, so the surfaces
  disagreed.
- 186 (preview) / 485 (portal) interactive elements measured under 36px on
  a side — checkboxes at 17px, switches at 21px, small/icon buttons at
  28–32px — far below the ~44px touch guideline.
- The app-shell demo kept its fixed `184px + 1fr` desktop grid at phone
  width, clipping the page-header actions.

## Decision

Three conventions, applied to both surfaces and to everything added later:

1. **Site chrome must offer navigation at every width.** The preview gets a
   hamburger → fixed slide-in drawer (scrim, Escape/scrim/link-tap close)
   reusing the same nav markup; the portal already had shadcn's sheet
   sidebar.
2. **Text inputs never render under 16px on phones.** The preview mirrors
   shadcn's idiom with a `@media (max-width: 767px)` 16px floor on
   `.input/.select/.textarea/.addon-select`; new portal inputs use
   `text-base md:text-sm` (the command palette input was brought in line).
   This exists solely to defeat iOS focus-zoom — do not "fix" it back to
   the type scale.
3. **≥44px effective touch targets on coarse pointers, visuals unchanged.**
   Hit areas are extended with an invisible positioned pseudo-element that
   pads a control out to 44px per axis when it is smaller
   (`min(0px, calc((100% - 44px) / 2))` insets). base-nova already ships
   `after:-inset-*` extensions on checkbox/radio/switch; the portal adds an
   `::after` rule for button/toggle/pagination/menubar slots in
   `src/index.css`, and the preview mirrors it in `portal.css` — using
   `::before` for native checkbox/radio/switch, whose `::after` already
   draws the glyph/thumb. We extend hit areas rather than resize controls
   so desktop density and the type/spacing scales stay untouched.

Exclusion: `tabs-trigger` keeps its own `::after` (the active-line
indicator) and is left out of the portal rule — tab triggers are already
tall, adjacent targets.

## Consequences

- The 390px verification scan now checks usability (drawer works, input
  font ≥16px, hit extension resolves via `elementFromPoint`), not just
  overflow.
- Demos that model an app frame (app shell, settings, wizard) must stack
  or re-flow below ~720px; the fixed-rail version is desktop-only.
- Any new compact control (< 44px) must either sit in one of the covered
  slots/classes or add itself to the coarse-pointer rule in the same turn.
