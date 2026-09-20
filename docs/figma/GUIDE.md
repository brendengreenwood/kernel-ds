# Figma workflow

How Kernel DS work happens in Figma via the console bridge (figma-console MCP), and how it stays tied to the DSDS catalog.

## Principles

- **Code-led.** The repo is the source of truth: tokens live in `kernel-portal/src/index.css`, components in `@kernel/ui`, and the catalog (`packages/catalog`) is the canonical inventory. Figma reflects code; when both drift, code wins and we push code back into Figma.
- **DSDS is the bridge.** Every Figma component/variable collection that matters maps to a catalog entity ID (`component.button`, `element.field`, ...). The mapping lives in `docs/figma/figma-map.json` (sidecar for now; may be promoted into the catalog schema via a decision record).
- **Nothing orphaned.** Don't create Figma components that have no catalog entity. If Figma work reveals a missing entity, register it in the catalog first (kernel-ds-component / kernel-ds-pattern skills).

## The file

- Figma file: **Kernel DS** (`du0qpv9XrTt4HEWdPhesUh`)
- Pages (target structure):
  - `Tokens` — swatch/reference sheets generated from variables
  - `Components` — one section per catalog component, component sets with variants
  - `Patterns` — compositions built from component instances only
  - `Playground` — scratch space; anything here is disposable

## Token sync (round trip)

- Push code → Figma: `figma_import_tokens` with DTCG generated from `index.css` (`:root`/`.dark` become Light/Dark modes).
- Pull Figma → review: `figma_export_tokens` with `strategy: dry-run` to see drift; code-led means drift is resolved by re-importing from code unless we deliberately adopt the Figma change (then edit `index.css` through the kernel-token skill and re-import).
- `tokens.config.json` at repo root pins the Figma file and formats once sync is established.

## Component rules

- Build components as **component sets with variant properties** matching the code API (variant/size/state props mirror `@kernel/ui` prop names where possible).
- Compose: complex layouts are instances of smaller components — never detached copies.
- Bind every fill/stroke/radius/spacing to a variable. Hardcoded values fail lint (`figma_lint_design`).
- Name layers and components after catalog IDs: component `Button` ↔ `component.button`.
- After creating/changing a set, record its node ID + key in `figma-map.json`.

## Working discipline

- Verify the connected file name before destructive operations (multiple files can have the bridge plugin open).
- Screenshot before and after placement work; never overlap existing content; delete partial artifacts on failure.
- Same-turn docs: meaningful Figma work gets a worklog entry like any other change.

## Status

- [x] File renamed to "Kernel DS"
- [x] Tokens imported (280 vars: Kernel Semantic 32 Light/Dark, Kernel Primitives 240, Kernel Metrics 8) — built via `scripts/ds/figma/build-figma-tokens.mjs`
- [ ] tokens.config.json committed (blocked: `figma_export_tokens` reads a stale source for this draft file and sees 0 collections; pull path uses `figma_get_variables` via the bridge for now)
- [x] Tokens reference page built (Semantic / Primitives / Metrics sheets, all variable-bound)
- [x] First component built + mapped: Button (24 variants, Variant×Size mirroring `buttonVariants`)

Note: tokens now live in `packages/ui/src/styles.css` (not `kernel-portal/src/index.css` as written above).
