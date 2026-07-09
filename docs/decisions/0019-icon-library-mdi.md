# 0019 — Icon library: MDI (Material Design Icons)

**Status:** accepted · 2026-07-09
**Supersedes:** the implicit "icons come from `lucide-react`" convention (never formally recorded).

## Decision

The icon set is **MDI** (Material Design Icons, `@mdi/js` — path data only). Both
surfaces use it:

- **Portal (real build):** icons import from a shim at
  `kernel-portal/src/components/ui/icon.tsx`, **not** from a third-party React
  icon component package. The shim exports lucide-named glyph components
  (`Gauge`, `ChevronRight`, `Search`, …) backed by `@mdi/js` path strings. It is
  a drop-in for the lucide-react API we used: each component accepts `className`,
  `size`, and standard SVG props, renders `fill="currentColor"` at 24×24 by
  default, and lets Tailwind `size-*` classes override. `strokeWidth` /
  `absoluteStrokeWidth` are accepted and ignored (MDI is path-filled, not
  stroked). `lucide-react` is removed from `package.json`.
- **Preview (static mirror):** the hand-inlined `<svg>` glyphs in
  `Kernel Design System.html` are single-path MDI (`fill="currentColor"`), and
  the select-arrow data-URIs in `portal.css` + the pager chevrons in `portal.js`
  use MDI paths too.

## Why

- **One named-glyph API, our own module.** Routing every call site through
  `@/components/ui/icon` means a future icon-set change is one file, and the 42
  files that imported `lucide-react` (including shadcn `ui/*`) only had their
  import *specifier* rewritten — call-site JSX is unchanged.
- **MDI is a filled set; lucide is outline.** This is a deliberate visual shift.
  To keep the system from reading much heavier, the shim and the preview prefer
  MDI's **`*Outline`** variants where they exist (`mdiHomeOutline`,
  `mdiCogOutline`, `mdiInformationOutline`, …); glyphs that are single-weight by
  nature (chevrons, arrows, check, plus, minus, close) use the base path.

## How it stays mirrored

- Portal call sites: `import { X } from "@/components/ui/icon"` — never from a
  third-party icon package. When a shadcn component is added via the CLI it will
  import from `lucide-react`; **redirect those imports to the shim** and add any
  missing glyph to the shim's map (`lucide name → mdi* export`, prefer
  `*Outline`).
- Preview glyphs are MDI single paths with `fill="currentColor"` (or a token
  color for the sidebar brand mark). No `stroke`-based icon SVGs remain.
- The brand mark has no MDI "Kernel" glyph, so it uses `Sprout`
  (`mdiSproutOutline`) — same rationale as before, now sourced from MDI.

## Consequences

- Bundle: `@mdi/js` named imports tree-shake to only the ~80 paths used.
- Any new icon must exist in `@mdi/js`; a handful of lucide names have no exact
  MDI twin and map to the nearest glyph (e.g. lucide `Route` → `mdiSitemapOutline`,
  `PanelsTopLeft` → `mdiViewQuiltOutline`, `Sparkles` → `mdiCreation`).
