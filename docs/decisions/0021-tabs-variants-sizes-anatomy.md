# 0021 — Tabs: variants, sizes, and anatomy

**Status:** accepted · 2026-07-09

## Decision

Tabs get a first-class system on both surfaces, matching the language the tables
already use for density.

**Variants** (three):
- **pill** *(default)* — segmented `--muted` container; the active tab fills
  with **`--primary`** / `--primary-foreground`. This is the restyle of the tabs
  we had (they were a neutral segmented control with a card-colored active tab).
- **underline** — transparent, tabs sit on a bottom border; the active tab shows
  a **`--primary`** underline.
- **folder** — file-folder tabs with top-rounded corners that lift onto the panel
  (active tab = `--card` + border, overlapping the list's bottom border).

**Sizes** (three) — named to match the table density knobs and wired to the same
control-height tokens: **compact** (`--control-h-sm`), **default** (`--control-h`),
**comfortable** (`--control-h-lg`). On coarse pointers those tokens already grow
(40/44/48), so tabs stay touch-sized without extra rules.

**Anatomy** — every tab, in every variant, can carry:
- a **leading icon** (MDI),
- a trailing **count badge** — `<TabCount>` (portal) / `.tab-count` (preview);
  it inverts with the tab's current color (`bg-current/15`), so it reads on an
  inactive tab and on a filled active pill alike,
- a **notification** indicator — `<TabDot>` / `.tab-dot` (a small `--destructive`
  dot) or any MDI glyph (e.g. a `--warning-600` alert) dropped inline.

## How it works

- Portal: `TabsList` takes `variant` + `size` and stamps `data-variant` /
  `data-size`; `TabsTrigger` reads them through `group-data-[variant=…]` /
  `group-data-[size=…]` selectors, so triggers stay prop-free (same pattern the
  component already used for `line`).
- Preview: base `.tabs-list` is the pill container; `.tabs-list.underline` /
  `.folder` and `.compact` / `.comfortable` are modifiers. `portal.js`'s existing
  per-`.tabs` active toggle already covers every variant.

## Mobile

Tab strips are atomic-width rows, so they scroll in place rather than push the
page (CLAUDE.md): the portal wraps the list in `overflow-x-auto`; the preview
scrolls the `.tabs-list` and gives `.tabs` `width:100%; min-width:0` so the flex
item can shrink instead of ballooning to content width. Verified 0 overflow at
390px on both surfaces.

## Notes

- Making **pill** the default restyles existing `<Tabs>` usages (nav patterns,
  etc.) to the primary-active look — intended.
- Base UI activation semantics (manual: arrows move focus, Enter/Space activates)
  are unchanged and still pending a11y sign-off.
