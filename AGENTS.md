Prefer most specific AGENTS.md for changed area
For work in a package read package-local AGENTS.md first: packages/catalog/AGENTS.md, kernel-portal/AGENTS.md, or kernel-studio-server/AGENTS.md
Project rules, conventions, and design decisions live in CLAUDE.md — read it before changing tokens, components, or nav

minimal root npm workspace for packages/* only; no pnpm
packages/catalog — canonical typed inventory for design-system entities; run its commands through root workspace scripts
kernel-portal — independently installed React 19 + Vite + shadcn + Tailwind v4 app; the only shipped surface (Netlify deploys kernel-portal/dist)
kernel-studio-server — independently installed Mastra dev server; generative design agent authoring against the ds-bundle
portal and Studio keep their own lockfiles and package-local commands; the root workspace must not absorb either application

Prefer narrowest build/test/typecheck; do not run both applications when one is enough
Catalog: npm run catalog:test, npm run catalog:check, node kernel-portal/scripts/check-catalog.mjs
Portal: cd kernel-portal && npm run build (tsc -b && vite build), npm run lint (oxlint)
Studio: cd kernel-studio-server && npm test (vitest run), npm run check (tsc --noEmit)
Portal has no vitest suite — its checks are gate scripts run with node (see kernel-portal/AGENTS.md)
Run the narrowest relevant local checks before committing or opening a PR

ds-bundle/ (repo root) is a generated artifact built by kernel-portal/scripts/build-ds-bundle.mjs — never edit by hand; rebuild it instead. The studio agents read it
node --experimental-strip-types runs the .mts/.ts gate scripts directly (Node 24)

Docs are part of every change (see docs/GUIDE.md and docs/AGENTS.md)
Same turn as a meaningful change: append docs/worklog/YYYY-MM.md, update docs/STATE.md, add docs/decisions/ record if a convention/dependency/architecture shifted, archive stale STATE sections to docs/archive/
Rituals are encoded as skills in .agents/skills/ (kernel-token, kernel-feature, kernel-verify, kernel-ship) — reach for them instead of re-deriving

Architecture
packages/catalog/src — canonical typed entity schema and generated catalog data; framework-free and consumed by repository tooling
kernel-portal/src — index.css (tokens: :root/.dark/@theme), main.tsx (routes), components/ (ui shadcn primitives + portal chrome/pages), lib/ (component-docs + objects object-model runtime), pages/ (gallery), scripts/ (verification gates)
kernel-studio-server/src — mastra/ (agents, tools, workflows, storage, rag, evals, processors), api/ (hono routes), lib/paths.ts (cross-package path resolution), contract/ (shared schema), __tests__/ (vitest)
kernel-studio-server/prototypes — generated grain-ops workspace prototypes; reference only, do not edit unless asked
