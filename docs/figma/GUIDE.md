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

## Components page organization

- **One Section per catalog entity**, named after the component (`Button`, `Input`, `Sidebar`). Everything belonging to that component lives inside its section — the variant set (arranged grid), sub-components, and a usage specimen if useful.
- **Sections stack vertically** in a single column at x=0, alphabetical, 160px apart. New sections go at the bottom; never overlap.
- **Sub-components are namespaced** `Parent / Part` (e.g. `Sidebar / Menu Button`) and live inside the parent's section, above the assembled component.
- **Sections are the undo firewall.** All edits happen inside a section; nothing component-related sits loose on the page canvas. Loose nodes on the Components page are treated as drift and cleaned up.
- **figma-map.json is the register.** A component that isn't recorded there (node ID + key) doesn't exist as far as the DS is concerned — recovery after accidental deletion starts from the map, so record IDs the same turn the component is built.
- **Deletion is a code-level event.** If a set disappears (undo collateral, cleanup), rebuild from the code API + map entry; never re-draw from memory of the pixels.

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

## Hardened gotchas
- Never combine paint-level opacity with a bound color variable. Figma silently resets paint opacity to 1 on bind, clone, instance creation, and mode re-evaluation. Bake alpha into a dedicated variable instead (e.g. semantic/destructive-10, semantic/ring-50) and bind at paint opacity 1.
- Mode previews use instances in a frame with explicitVariableModes, never clones of sections containing component sets (clones duplicate the components).
