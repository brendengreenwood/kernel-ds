Two runtime subsystems: component-docs (the doc-entity system) and objects (the object-model runtime), plus shared lib helpers

type-styles.ts — the typeStyles source of truth; typeStyles.overline is the one canonical eyebrow/overline recipe. check-style-fidelity.mjs enforces that hand-rolled uppercase+tracking treatments route through it. Override only the color via cn(typeStyles.overline, "text-...")
gallery-types.ts — gallery cluster/demo types

component-docs/
schema.ts — Zod schema for doc entities; 9 typed block kinds (guidelines, variants, anatomy, api, states, accessibility, use-cases, decisions, examples). parseComponentDoc + conformance classifier (minimal/documented/complete)
<slug>.ts — one entity per component/element/pattern/mark (81 files). index.ts is the barrel — a new entity MUST be imported and mapped there or getComponentDoc(slug) returns undefined
Enriched shapes: variant groups + anatomy slots + ARIA attrs accept string | { key/name, description } (backward-compatible)
Gates (run from kernel-portal/): node scripts/check-component-docs.mjs (parity + --coverage), node scripts/check-prose-quality.mjs (no placeholders), node --experimental-strip-types src/lib/component-docs/__check__.mts (schema assertions)
Prose bar: concrete summary, reasoned do/don't, domain-grounded use cases — no mad-lib filler (the prose gate enforces this)

objects/
Object model: Shell → Workspace → Collection → Record. objectModelSchema (Zod); parseObjectModel derives coordinates via djb2
Runtime registry uses useSyncExternalStore. ObjectKey/WorkspaceMode are widened strings
Workspace presets: workspacePresetSchema, per-idiom coherence
Assertions: node --experimental-strip-types src/lib/objects/__check__.mts
Agent-authored definitions land in ../../public/definitions and are loaded at boot by the definitions loader (SPA-redirect tolerant, cache: no-store, per-document failure isolation)
