# Kernel design system — project rules


> Operational map (build/test/typecheck commands, package layout, architecture) lives in **`AGENTS.md`** — and per-package `kernel-portal/AGENTS.md` / `kernel-studio-server/AGENTS.md`. Read the most specific AGENTS.md for the area you're changing. This file carries the design conventions and shaping decisions.

## Single surface: the portal
The design system lives in `kernel-portal/` (React 19 + Vite + shadcn + TypeScript) — it is the only surface (decision 0022; the hand-maintained static preview was retired 2026-07-10). Netlify deploys `kernel-portal/dist`. Whenever we add or change anything, update **all** of the relevant places in the same turn:

When **tokens** change (color scales, status, type, spacing, shadows, radius):
- `kernel-portal/src/index.css` — `:root`, `.dark`, **and** the `@theme inline` maps
- The **Color**/**Typography** foundation sections in `kernel-portal/src/components/portal/foundations.tsx`
- `kernel-portal/README.md` (Color system / Type scale sections)

When a **component, form element, or pattern** is added/changed:
- The matching `kernel-portal/src/components/portal/*.tsx` (and any `src/components/ui/*.tsx` customizations)
- Wire it in as a **route** (decision 0011): a section adds a `<Route>` in `kernel-portal/src/main.tsx` + a rail entry in `src/components/portal/app-sidebar.tsx`; a component adds its cluster to the relevant `gallery-*.tsx` exported list (`galleryClusters` and the nav read from it — no separate page file needed). Record its status in `component-meta.ts`.
- `kernel-portal/README.md` (file map, component coverage, customized-components notes)

When **nav sections** change: update `app-sidebar.tsx` and add the matching route in `main.tsx`. Every rail item is its own page (decision 0011); reuse the old anchor id as the route slug so `routeForAnchor()` keeps legacy `#hash` links working; never reintroduce a single-scroll page or a scrollspy.

## Documentation (part of every change — see `docs/README.md`)
The `docs/` directory is the project's memory. In the **same turn** as any meaningful change:
- **Append** a what/why/touched entry to `docs/worklog/YYYY-MM.md` (append-only; never rewrite old entries).
- **Update** `docs/STATE.md` so it matches reality (current state, in-flight items, open questions).
- If the change involved a **shaping decision** (convention, dependency, architecture), add an immutable record to `docs/decisions/` — supersede old records with new ones, never edit them.
- When a `STATE.md` section is no longer active, **archive** it to `docs/archive/YYYY-MM-DD-topic.md` instead of deleting it.

## Project skills (`.agents/skills/`)
The recurring rituals above are encoded as invocable skills — reach for them instead of re-deriving the steps:
- **`kernel-token`** — add/change a color scale or design token (OKLCH ramp + `@theme` maps + foundations + contrast audit).
- **`kernel-feature`** — add/change a component or pattern with the per-page route + `component-meta`.
- **`kernel-verify`** — build + `tsc` + mobile-audit (390px) + contrast-audit + screenshot the portal, light/dark.
- **`kernel-ship`** — worklog + STATE + decision docs, commit to the working branch, PR, and Netlify deploy verify.

Craft/principles skills — consult when designing or reviewing, not just building:
- **`kernel-typesetting`** — typesetting, vertical rhythm, and layout done well, on the 4pt baseline grid (measure, leading, tracking, hierarchy, alignment, proximity, negative space).
- **`kernel-norman`** — Don Norman's usability principles (affordance/signifier/mapping/feedback/constraints/mental model, the two gulfs, designing for error).
- **`kernel-visual`** — color, contrast (WCAG AA), visual hierarchy, and Gestalt grouping done well (the three color axes, redundant coding, squint test).

## Conventions
- No web fonts. `--font-sans` and `--font-mono` are native system stacks only (no Inter, no Roboto Mono, no `next/font`, no `<link>` tags). No serif.
- Three color axes, never crossed: statuses = persistent lifecycle state (`--status-*`, `<StatusBadge>`); notifications = momentary event outcome (`success`/`warning`/`info` on `Alert`/`Badge`); commodities = which grain (`--commodity-*`, `<CommodityBadge>`; corn/canola/soybeans/wheat — decision 0013). `--viz-*` stays abstract (chart series that must not read as a status). Never conflate them.
- Color families are full 50→950 scales, except the four notification scales (`success`/`warning`/`error`/`info`), which run 50→900 by design (see decision 0004). New hues (viz series, `--commodity-*`) follow the brand/viz ramp (50→950 + `-light`/base/`-dark` aliases). Commodity ramps are generated from one canonical table in `index.css`.
- Control density comes from the `--control-h-sm/-h/-h-lg` tokens (32/38/44px; decision 0010) — buttons, inputs, and select triggers reference them; never hardcode a control height. On coarse pointers the tokens themselves grow (40/44/48px).
- Motion is token-driven (decision 0018): timing (`--duration-fast/-base/-slow` 120/200/320ms) + easing (`--ease-out`/`-in-out`/`-spring`) tokens; animate with `duration-[var(--duration-base)] ease-[var(--ease-out)]`, never ad-hoc ms/curves. `index.css` carries a `prefers-reduced-motion: reduce` guard that near-zeros motion — keep it; new motion inherits it for free. Richer engines (`@number-flow/react`, `@formkit/auto-animate`, `motion`) are opt-in npm libs.
- Icons are **MDI** (decision 0019). Import glyphs from the shim `@/components/ui/icon` (lucide-named components backed by `@mdi/js` paths) — **never** from `lucide-react` or another icon package. Adding a new glyph = add one `lucide name → mdi* export` line to the shim's map (prefer the `*Outline` variant so the filled set stays close to lucide's weight); when a shadcn CLI component lands with `lucide-react` imports, redirect them to the shim.
- Grids that can sit beside the sidebar use `auto-fit, minmax(...)` (not `1fr`) to avoid page overflow.
- Mobile ergonomics (decisions 0007 + 0009): site chrome must offer navigation at every width; text inputs never render under 16px on phones (`text-base md:text-sm`) — this defeats iOS focus-zoom, don't "fix" it back to the type scale. On coarse pointers (the `@media (pointer: coarse)` block at the end of `kernel-portal/src/index.css`): primary controls (buttons, inputs, select triggers) visibly grow to 44px min-height (compact sizes 40px), while controls that stay small by design (checkbox/radio/switch, kebabs, dense chips) keep ≥44px *effective* targets via invisible pseudo-element hit extensions — new controls pick one of those two mechanisms and get added to that block.
- No mobile horizontal overflow: responsive Tailwind grids always declare the mobile column explicitly (`grid grid-cols-1 … sm:grid-cols-2`) — an implicit auto column sizes to content and blows out the page. Raw `1fr` in `grid-cols-[…]` must be `minmax(0,1fr)`. Atomic-width rows (segmented controls, tab strips) and data tables get `overflow-x-auto` so they scroll in place — never let an `overflow: hidden` frame amputate table columns (shadcn's `table-container`). Verify after layout changes with `node kernel-portal/scripts/mobile-audit.mjs <url>` (390px scan: overflow, clipped content, sub-16px inputs, effective hit areas).
- Domain is a grain-buying merchant platform (loads, contracts, farms, bushels, basis, settlement). Keep example copy in that world.
- After changes: `done` → fix console errors → `fork_verifier_agent`.
