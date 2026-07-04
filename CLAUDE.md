# Kernel design system — project rules

## Keep everything in sync on EVERY change
This project has a preview (`Kernel Design System.html` + `theme.css` + `portal.css` + `portal.js`) AND a real shadcn build (`kernel-portal/`). They must stay mirrored. Whenever we add or change anything, update **all** of the relevant surfaces in the same turn:

When **tokens** change (color scales, status, type, spacing, shadows, radius):
- `theme.css` (preview) **and** `kernel-portal/src/index.css` (`:root`, `.dark`, and the `@theme inline` maps)
- The in-portal **"4 · Tokens — complete reference"** blocks in the Install section of `Kernel Design System.html` (regenerate the full list — it is exhaustive, not an excerpt)
- The **Color**/**Typography** foundation sections in both `Kernel Design System.html` and `kernel-portal/src/components/portal/foundations.tsx`
- `kernel-portal/README.md` (Color system / Type scale sections)

When a **component, form element, or pattern** is added/changed:
- Preview markup in `Kernel Design System.html` + styles in `portal.css`
- Real build: the matching `kernel-portal/src/components/portal/*.tsx` (and any `src/components/ui/*.tsx` customizations)
- Wire into `kernel-portal/src/pages/portal.tsx` + the sidebar nav in `src/components/portal/app-sidebar.tsx`, and the nav + scrollspy in `Kernel Design System.html`
- `kernel-portal/README.md` (file map, component coverage, customized-components notes)

When **nav sections** change: update the sidebar in both the HTML and `app-sidebar.tsx`.

## Documentation (part of every change — see `docs/README.md`)
The `docs/` directory is the project's memory. In the **same turn** as any meaningful change:
- **Append** a what/why/touched entry to `docs/worklog/YYYY-MM.md` (append-only; never rewrite old entries).
- **Update** `docs/STATE.md` so it matches reality (current state, in-flight items, open questions).
- If the change involved a **shaping decision** (convention, dependency, architecture), add an immutable record to `docs/decisions/` — supersede old records with new ones, never edit them.
- When a `STATE.md` section is no longer active, **archive** it to `docs/archive/YYYY-MM-DD-topic.md` instead of deleting it.

## Conventions
- No web fonts. `--font-sans` and `--font-mono` are native system stacks only (no Inter, no Roboto Mono, no `next/font`, no `<link>` tags). No serif.
- Statuses = persistent lifecycle state (`--status-*`, `<StatusBadge>`); notifications = momentary event outcome (`success`/`warning`/`info` on `Alert`/`Badge`). Never conflate them.
- Color families are full 50→950 scales, except the four notification scales (`success`/`warning`/`error`/`info`), which run 50→900 by design (see decision 0004). New hues follow the brand/viz ramp (50→950).
- Grids that can sit beside the sidebar use `auto-fit, minmax(...)` (not `1fr`) to avoid page overflow.
- Mobile ergonomics (decisions 0007 + 0009): site chrome must offer navigation at every width (preview uses the hamburger drawer); text inputs never render under 16px on phones (preview: ≤767px floor in `portal.css`; portal: `text-base md:text-sm`) — this defeats iOS focus-zoom, don't "fix" it back to the type scale. On coarse pointers (`@media (pointer: coarse)` blocks at the end of `portal.css` and `kernel-portal/src/index.css`): primary controls (buttons, inputs, select triggers) visibly grow to 44px min-height (compact sizes 40px), while controls that stay small by design (checkbox/radio/switch, kebabs, dense chips) keep ≥44px *effective* targets via invisible pseudo-element hit extensions — new controls pick one of those two mechanisms and get added to those blocks. App-frame demos (app shell, settings, wizard) stack below ~720px/`md`.
- No mobile horizontal overflow: responsive Tailwind grids always declare the mobile column explicitly (`grid grid-cols-1 … sm:grid-cols-2`) — an implicit auto column sizes to content and blows out the page; in preview CSS, grid children get `min-width: 0` (see `.grid-2 > *`). Raw `1fr` in `grid-cols-[…]` must be `minmax(0,1fr)`. Atomic-width rows (segmented controls, tab strips) and data tables get `overflow-x-auto` so they scroll in place — never let an `overflow: hidden` frame amputate table columns (preview: `.table-wrap`/`.crud-scroll`; portal: shadcn's `table-container`). Verify after layout changes with `node kernel-portal/scripts/mobile-audit.mjs <url>` (390px scan: overflow, clipped content, sub-16px inputs, effective hit areas).
- Domain is a grain-buying merchant platform (loads, contracts, farms, bushels, basis, settlement). Keep example copy in that world.
- After changes: `done` → fix console errors → `fork_verifier_agent`.
