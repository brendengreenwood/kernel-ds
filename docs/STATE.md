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
   TypeScript portal using shadcn/ui (Base UI, `base-nova` style — see
   decision 0005) + Tailwind CSS v4 + React Router. Tokens live in `kernel-portal/src/index.css`; components in
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
- Portal runs on **Base UI** (`@base-ui/react`, style `base-nova`) as of
  2026-07-04 — decision 0005 executed; radix removed. Migration reports in
  `kernel-portal/.migration/`; flagged behavior deltas: tabs manual
  activation, menu checkbox/radio items don't close on click, nav-menu 50ms
  hover delay.
- **Component lifecycle statuses** (decision 0006): experimental/ready/
  deprecated tracked in `kernel-portal/src/lib/component-meta.ts`, shown as
  Primer-style per-component side-rail entries with maturity pills and a
  Component status overview section — both surfaces. Currently
  experimental: the five delta-flagged components + contract-detail. A11y
  review column is `pending` everywhere until backlog #3 runs.
- Fonts: native system stacks only (`--font-sans`, `--font-mono`), no web
  fonts, no serif — see decision 0002.
- Statuses vs notifications are distinct systems — see decision 0003.
- Netlify deploy configured for `kernel-portal` (build command, publish dir,
  SPA redirect).
- Docs system (this directory) in place — see decision 0001.
- CI quality gates: GitHub Actions (`.github/workflows/ci.yml`) runs
  `npm ci` + `tsc -b` + build + lint (oxlint, blocking) for `kernel-portal`
  on every PR and push to `main`. Branch protection requiring the check
  must be enabled by the repo owner in GitHub settings.

## In flight

- **Domain patterns (backlog #2), 1 of 4 done.** Approved lineup: contract
  detail ✓ → settlement statement (next) → load ticket entry flow → basis &
  bid board. Each lands on both surfaces under the **Domain** nav group.

## Backlog (in priority order)

1. ~~Sync audit~~ ✓ done 2026-07-03 (see worklog; surfaces verified mirrored)
2. **Domain patterns** → in flight (approved lineup: contract detail ✓,
   settlement statement, load ticket entry flow, basis & bid board —
   scale-ticket table dropped; its data lives in fills + load entry).
3. **Accessibility pass** — contrast ratios across the 50→950 ramps and
   status colors in light + dark; focus states; keyboard nav in interactive
   patterns.
4. **Usage guidance** — do/don't guidance in the portal (when to use which
   component; StatusBadge vs Alert per decision 0003) so it teaches, not
   just shows.

## Open questions

*(none currently)*
