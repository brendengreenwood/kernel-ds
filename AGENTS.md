Prefer most specific AGENTS.md for changed area
For work in a package read package-local AGENTS.md first: kernel-portal/AGENTS.md or kernel-studio-server/AGENTS.md
Project rules, conventions, and design decisions live in CLAUDE.md — read it before changing tokens, components, or nav

two sibling npm packages, no workspace root, no pnpm
kernel-portal — React 19 + Vite + shadcn + Tailwind v4 + TypeScript; the only shipped surface (Netlify deploys kernel-portal/dist)
kernel-studio-server — Mastra dev server; generative design agent authoring against the ds-bundle
each package installs and builds on its own; run npm commands from inside the package dir

Prefer narrowest build/test/typecheck; do not run both packages when one is enough
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
kernel-portal/src — index.css (tokens: :root/.dark/@theme), main.tsx (routes), components/ (ui shadcn primitives + portal chrome/pages), lib/ (component-docs + objects object-model runtime), pages/ (gallery), scripts/ (verification gates)
kernel-studio-server/src — mastra/ (agents, tools, workflows, storage, rag, evals, processors), api/ (hono routes), lib/paths.ts (cross-package path resolution), contract/ (shared schema), __tests__/ (vitest)
kernel-studio-server/prototypes — generated grain-ops workspace prototypes; reference only, do not edit unless asked
