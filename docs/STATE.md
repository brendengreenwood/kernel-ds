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

Also present: `kernel-portal-src/` — an earlier Next-style layout
(`app/`, `components/`) that predates the Vite port. See open questions.

## Current state

- Full token system: two-layer color tokens (50→950 scales + semantic layer),
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

## Open questions

- **`CLAUDE.md` paths are stale.** It references a Next.js layout
  (`kernel-portal/app/globals.css`, `app/page.tsx`, `components/portal/*.tsx`)
  but the actual build is Vite (`kernel-portal/src/index.css`,
  `src/pages/portal.tsx`, `src/components/portal/`). CLAUDE.md sync rules
  should be updated to the real paths.
- **`kernel-portal-src/` status unclear.** It looks like the pre-Vite source
  layout. If it's dead, archive or delete it; if it's the sync source for
  something, document that.
