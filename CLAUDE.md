# Kernel design system — project rules

## Keep everything in sync on EVERY change
This project has a preview (`Kernel Design System.html` + `theme.css` + `portal.css` + `portal.js`) AND a real shadcn build (`kernel-portal/`). They must stay mirrored. Whenever we add or change anything, update **all** of the relevant surfaces in the same turn:

> **One carve-out (decision 0012):** a feature that fundamentally can't exist on the static side — e.g. a third-party **React** package like `border-beam` — is portal-only. Don't hand-reimplement it in the preview to fake parity; instead mark it "portal-only" in its `component-meta` note + STATE and record why. A CSS approximation, if ever wanted, is its own tracked task.

When **tokens** change (color scales, status, type, spacing, shadows, radius):
- `theme.css` (preview) **and** `kernel-portal/src/index.css` (`:root`, `.dark`, and the `@theme inline` maps)
- The in-portal **"4 · Tokens — complete reference"** blocks in the Install section of `Kernel Design System.html` (regenerate the full list — it is exhaustive, not an excerpt)
- The **Color**/**Typography** foundation sections in both `Kernel Design System.html` and `kernel-portal/src/components/portal/foundations.tsx`
- `kernel-portal/README.md` (Color system / Type scale sections)

When a **component, form element, or pattern** is added/changed:
- Preview markup in `Kernel Design System.html` + styles in `portal.css`
- Real build: the matching `kernel-portal/src/components/portal/*.tsx` (and any `src/components/ui/*.tsx` customizations)
- Wire into the portal as a **route** (decision 0011): a section adds a `<Route>` in `kernel-portal/src/main.tsx` + a rail entry in `src/components/portal/app-sidebar.tsx`; a component adds its cluster to the relevant `gallery-*.tsx` exported list (`galleryClusters` and both nav surfaces read from it — no separate page file needed). In the preview add the `<section class="section" id="…">` + a `.nav-link` (the `portal.js` hash router shows one section at a time).
- `kernel-portal/README.md` (file map, component coverage, customized-components notes)

When **nav sections** change: update the sidebar in both the HTML and `app-sidebar.tsx`, and add the matching portal route (`main.tsx`) / preview `<section>`. Every rail item is its own page (decision 0011): portal = a React Router route; preview = a `.section` toggled by the `portal.js` hash router. Reuse the old anchor id as the route slug so `routeForAnchor()` keeps legacy `#hash` links working; never reintroduce a single-scroll page or a scrollspy.

## Documentation (part of every change — see `docs/README.md`)
The `docs/` directory is the project's memory. In the **same turn** as any meaningful change:
- **Append** a what/why/touched entry to `docs/worklog/YYYY-MM.md` (append-only; never rewrite old entries).
- **Update** `docs/STATE.md` so it matches reality (current state, in-flight items, open questions).
- If the change involved a **shaping decision** (convention, dependency, architecture), add an immutable record to `docs/decisions/` — supersede old records with new ones, never edit them.
- When a `STATE.md` section is no longer active, **archive** it to `docs/archive/YYYY-MM-DD-topic.md` instead of deleting it.

## Project skills (`.agents/skills/`)
The recurring rituals above are encoded as invocable skills — reach for them instead of re-deriving the steps:
- **`kernel-token`** — add/change a color scale or design token across every surface (OKLCH ramp + `@theme` + token reference + contrast audit).
- **`kernel-feature`** — add/change a component or pattern with both surfaces mirrored + the per-page route + `component-meta`.
- **`kernel-verify`** — build + `tsc` + mobile-audit (390px) + contrast-audit + screenshot both surfaces, light/dark.
- **`kernel-ship`** — worklog + STATE + decision docs, commit to the working branch, PR, and Netlify deploy verify.

Craft/principles skills — consult when designing or reviewing, not just building:
- **`kernel-typesetting`** — typesetting, vertical rhythm, and layout done well, on the 4pt baseline grid (measure, leading, tracking, hierarchy, alignment, proximity, negative space).
- **`kernel-norman`** — Don Norman's usability principles (affordance/signifier/mapping/feedback/constraints/mental model, the two gulfs, designing for error).
- **`kernel-visual`** — color, contrast (WCAG AA), visual hierarchy, and Gestalt grouping done well (the three color axes, redundant coding, squint test).

## Conventions
- No web fonts. `--font-sans` and `--font-mono` are native system stacks only (no Inter, no Roboto Mono, no `next/font`, no `<link>` tags). No serif.
- Three color axes, never crossed: statuses = persistent lifecycle state (`--status-*`, `<StatusBadge>`); notifications = momentary event outcome (`success`/`warning`/`info` on `Alert`/`Badge`); commodities = which grain (`--commodity-*`, `<CommodityBadge>`; corn/canola/soybeans/wheat — decision 0013). `--viz-*` stays abstract (chart series that must not read as a status). Never conflate them.
- Color families are full 50→950 scales, except the four notification scales (`success`/`warning`/`error`/`info`), which run 50→900 by design (see decision 0004). New hues (viz series, `--commodity-*`) follow the brand/viz ramp (50→950 + `-light`/base/`-dark` aliases). Commodity ramps are generated from one canonical table — keep the OKLCH values identical across `theme.css`, `index.css`, and the HTML token reference.
- Control density comes from the `--control-h-sm/-h/-h-lg` tokens (32/38/44px; decision 0010) — buttons, inputs, and select triggers reference them on both surfaces; never hardcode a control height. On coarse pointers the tokens themselves grow (40/44/48px).
- Motion is token-driven (decision 0018): timing (`--duration-fast/-base/-slow` 120/200/320ms) + easing (`--ease-out`/`-in-out`/`-spring`) tokens on both surfaces; animate with `duration-[var(--duration-base)] ease-[var(--ease-out)]` (portal) / `var(--…)` (preview), never ad-hoc ms/curves. Both surfaces carry a `prefers-reduced-motion: reduce` guard that near-zeros motion — keep it; new motion inherits it for free. Richer engines (`@number-flow/react`, `@formkit/auto-animate`, `motion`) are opt-in npm libs, portal-only (decision 0012).
- Icons are **MDI** (decision 0019). Portal: import glyphs from the shim `@/components/ui/icon` (lucide-named components backed by `@mdi/js` paths) — **never** from `lucide-react` or another icon package. Adding a new glyph = add one `lucide name → mdi* export` line to the shim's map (prefer the `*Outline` variant so the filled set stays close to lucide's weight); when a shadcn CLI component lands with `lucide-react` imports, redirect them to the shim. Preview: icon `<svg>`s are single-path MDI with `fill="currentColor"` (no `stroke`-based glyphs); the select-arrow data-URIs (`portal.css`) and pager chevrons (`portal.js`) are MDI too.
- Grids that can sit beside the sidebar use `auto-fit, minmax(...)` (not `1fr`) to avoid page overflow.
- Mobile ergonomics (decisions 0007 + 0009): site chrome must offer navigation at every width (preview uses the hamburger drawer); text inputs never render under 16px on phones (preview: ≤767px floor in `portal.css`; portal: `text-base md:text-sm`) — this defeats iOS focus-zoom, don't "fix" it back to the type scale. On coarse pointers (`@media (pointer: coarse)` blocks at the end of `portal.css` and `kernel-portal/src/index.css`): primary controls (buttons, inputs, select triggers) visibly grow to 44px min-height (compact sizes 40px), while controls that stay small by design (checkbox/radio/switch, kebabs, dense chips) keep ≥44px *effective* targets via invisible pseudo-element hit extensions — new controls pick one of those two mechanisms and get added to those blocks. App-frame demos (app shell, settings, wizard) stack below ~720px/`md`.
- No mobile horizontal overflow: responsive Tailwind grids always declare the mobile column explicitly (`grid grid-cols-1 … sm:grid-cols-2`) — an implicit auto column sizes to content and blows out the page; in preview CSS, grid children get `min-width: 0` (see `.grid-2 > *`). Raw `1fr` in `grid-cols-[…]` must be `minmax(0,1fr)`. Atomic-width rows (segmented controls, tab strips) and data tables get `overflow-x-auto` so they scroll in place — never let an `overflow: hidden` frame amputate table columns (preview: `.table-wrap`/`.crud-scroll`; portal: shadcn's `table-container`). Verify after layout changes with `node kernel-portal/scripts/mobile-audit.mjs <url>` (390px scan: overflow, clipped content, sub-16px inputs, effective hit areas).
- Domain is a grain-buying merchant platform (loads, contracts, farms, bushels, basis, settlement). Keep example copy in that world.
- After changes: `done` → fix console errors → `fork_verifier_agent`.
