# 0052 — Design-system CSS registers its own Tailwind `@source`

- Date: 2026-07-30
- Status: accepted

## Context

Extracting the UI components into `@kernel/ui` (decision 0044 era, PR #74) moved them
into `node_modules` for every consumer, including the portal's `file:` install.
Tailwind v4 auto-detects content from the consumer's project root but **excludes
`node_modules`**, so utility classes used only by the packaged components
(Sidebar `group-data-*`/`peer-data-*` variants, `--sidebar-width`, etc.) were
silently dropped from the built CSS. The portal shipped with unstyled chrome:
collapsed sidebar rail, oversized trigger icon, default black borders. Every
existing gate passed — the build succeeded and the boot smoke only checks that
the DOM mounts.

## Decision

`packages/ui/src/styles.css` (copied verbatim to `dist/styles.css`) carries an
explicit `@source "./";` directive after its imports. At consume time the
directive resolves relative to the shipped stylesheet
(`node_modules/@kernel/ui/dist`), whose compiled JS contains every `className`
string — an explicit `@source` is scanned even inside `node_modules`. The
distributed CSS is therefore self-sufficient: consumers import
`@kernel/ui/styles.css` and need no Tailwind configuration for the package's
component utilities.

Guard: `kernel-portal/scripts/check-portal-css.mjs` asserts the built portal
CSS contains component-utility sentinels (`--sidebar-width`, `group-data-`,
`peer-data-`) and runs in CI immediately after the portal build, before the
boot smoke.

## Consequences

- The `@source` directive in `packages/ui/src/styles.css` is load-bearing —
  removing it re-breaks every consumer's styling while all builds stay green
  except the portal CSS gate.
- Portal CSS grows to include all genuinely-used component utilities
  (~81 KB → ~244 KB pre-compression); this is the correct, complete output.
- Future consumers get correct styling with zero Tailwind config.
