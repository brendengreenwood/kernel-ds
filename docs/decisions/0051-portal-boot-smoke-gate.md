# 0051 — Portal CI must prove boot, not just build

- Date: 2026-07-30
- Status: accepted

## Context

The first successful Netlify deploy after the packages extraction shipped a blank
white page. The portal consumes `@kernel/ui` through a `file:` symlink; Vite
resolves through the symlink to `packages/ui`'s real path, where bare imports
("react", "next-themes", ...) resolve to the repo-root `node_modules` installed
by the workspace `npm ci`. Two React copies were bundled, and the app crashed on
boot (`Cannot read properties of null (reading 'useState')`). Every CI gate was
green because CI proves the portal *builds*, not that it *boots* — this failure
class is invisible to build success.

## Decision

1. `kernel-portal/vite.config.ts` declares `resolve.dedupe` for every dependency
   shared between the portal and `@kernel/ui`, forcing a single copy of React
   and of every context provider into the bundle. The list must be extended when
   `@kernel/ui` gains a shared dependency.
2. The portal CI job gains a boot smoke gate: `scripts/check-portal-boot.mjs`
   serves `dist/` via `vite preview`, drives headless Chromium at it, and fails
   on any console/page error or an empty `#root`. The same script accepts a URL
   argument to verify deployed environments (Netlify previews, production).

## Consequences

- A resolution-level regression now fails CI before it can deploy.
- Deploy verification means "the page rendered", not "the deploy returned 200".
- Dedupe proof: the production bundle dropped from 2,916 kB (3,976 modules) to
  2,649 kB (3,088 modules) once the duplicated dependency graph was removed.
