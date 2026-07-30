React 19 + Vite + shadcn + Tailwind v4 + TypeScript. The only shipped surface; Netlify deploys dist/
Run all commands from kernel-portal/ (npm, not pnpm)

Build: npm run build (tsc -b && vite build)
Lint: npm run lint (oxlint) — 0 errors is required; warnings are 76 today, keep the count from climbing. 73 are react/only-export-components (gallery cluster files export demos alongside their cluster list; several ui primitives co-locate a cva or a hook with their components), 3 are no-unused-expressions in scripts/contrast-audit.mjs
Dev: npm run dev (vite)
Typecheck alone: npx tsc -b --noEmit

No vitest suite here. Verification is a set of gate scripts + runtime __check__ assertions:
node scripts/check-component-docs.mjs — doc-entity ↔ source parity (variants, slots, props); must be 0 violations
node scripts/check-component-docs.mjs --coverage — every ready component has a doc entity
node scripts/check-prose-quality.mjs — no placeholder/mad-lib prose in doc entities
node scripts/check-style-fidelity.mjs — overlines route through typeStyles.overline; no rounded-xl/[ radius hardcodes
node scripts/check-status-map.mjs — status→tone map integrity (Amendment A4)
node scripts/emit-composition.mjs — composition contract rules (EMIT-OK)
node scripts/contrast-audit.mjs <url> — WCAG AA contrast on a running page
node scripts/mobile-audit.mjs <url> — 390px overflow / clipped content / sub-16px inputs / hit areas
node --experimental-strip-types src/lib/component-docs/__check__.mts — doc schema assertions
node --experimental-strip-types src/lib/objects/__check__.mts — object-model assertions
node src/components/ui/marks/__check__.mjs — marks assertions
Run the gates touching your change before committing; run all before a PR

Conventions (full detail in ../CLAUDE.md — read it)
Tokens change in 3 places together: index.css (:root + .dark + @theme inline maps), foundations.tsx sections, README.md
Icons only from @/components/ui/icon (MDI shim) — never lucide-react or another icon pkg
Control heights from --control-h-* tokens; motion from --duration-*/--ease-* tokens; never hardcode
No web fonts — --font-sans/--font-mono are native system stacks only
Overlines use typeStyles.overline (see check-style-fidelity); radius uses rounded-lg not rounded-xl
Domain copy stays in the grain-buying merchant world (loads, contracts, farms, bushels, basis, settlement)

Wiring a new section/component (decision 0011): route in main.tsx + rail entry in components/portal/app-sidebar.tsx; a component adds its cluster to the relevant gallery-*.tsx list and canonical @kernel/catalog lifecycle metadata, then runs `npm run catalog:generate` from the repo root — no separate page file and never hand-edit component-meta.generated.ts

Architecture (src/)
index.css — design tokens (OKLCH scales, status/commodity/viz, spacing, radius, shadows, motion) + @theme maps
main.tsx — router; every rail item is its own page (no single-scroll, no scrollspy)
components/ui/ — shadcn-derived primitives + local customizations (see components/ui/AGENTS.md)
components/portal/ — app chrome + doc/gallery/foundations pages + objects/ workspace (see components/portal/AGENTS.md)
lib/component-docs/ — doc-entity schema, 81 entities, parity/coverage/prose gates (see lib/AGENTS.md)
lib/objects/ — object-model runtime (Shell→Workspace→Collection→Record, Zod schema, registry)
hooks/ — shared React hooks (useChat SSE, etc.)
pages/gallery/ — clustered component demos + demos/<slug>-demo.tsx source files
scripts/ — verification gates (see scripts/AGENTS.md)
