# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-03

## What this project is

The **Kernel design system** for a grain-buying merchant platform (loads,
contracts, farms, bushels, basis, settlement). It ships as two mirrored
surfaces that must stay in sync:

1. **Static preview** — `Kernel Design System.html` + `theme.css` +
   `portal.css` + `portal.js` at the repo root. Zero-build, open-in-browser.
2. **Real build** — `kernel-portal/`: a runnable Vite 8 + React 19 +
   TypeScript portal using shadcn/ui (radix, nova preset) + Tailwind CSS v4 +
   React Router. Tokens live in `kernel-portal/src/index.css`; components in
   `src/components/ui/` (shadcn) and `src/components/portal/` (portal
   sections); entry `src/main.tsx` → `src/pages/portal.tsx`. Deploys to
   Netlify (`netlify.toml`: build to `dist/`, SPA redirect).

## Current state

- Both surfaces verified mirrored by the 2026-07-03 sync audit (tokens,
  values, nav, sections, HTML token reference; build passes).
- Full token system: two-layer color tokens (50→950 scales + semantic layer;
  notification scales run 50→900 by design — decision 0004),
  12-step type scale, spacing, shadows, radius — defined in both `theme.css`
  and `kernel-portal/src/index.css`, light + dark.
- Component coverage: shadcn registry components themed with Kernel tokens,
  form-element toolkit (states/sizes/affixes), CRUD patterns, status badges.
- Fonts: native system stacks only (`--font-sans`, `--font-mono`), no web
  fonts, no serif — see decision 0002.
- Statuses vs notifications are distinct systems — see decision 0003.
- Netlify deploy configured for `kernel-portal` (build command, publish dir,
  SPA redirect).
- Docs system (this directory) in place — see decision 0001.

## In flight

*(nothing currently — add items here when work starts, remove when the
worklog entry lands)*

## Backlog (in priority order)

1. ~~Sync audit~~ ✓ done 2026-07-03 (see worklog; surfaces verified mirrored)
2. **Domain patterns** — real merchant screens to pressure-test the system:
   settlement statement, load ticket entry flow, contract detail with
   basis/futures breakdown, scale-ticket table.
3. **Accessibility pass** — contrast ratios across the 50→950 ramps and
   status colors in light + dark; focus states; keyboard nav in interactive
   patterns.
4. **Usage guidance** — do/don't guidance in the portal (when to use which
   component; StatusBadge vs Alert per decision 0003) so it teaches, not
   just shows.

## Open questions

*(none currently)*
