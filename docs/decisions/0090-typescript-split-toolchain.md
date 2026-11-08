# 0090 — Portal runs TypeScript 7; declaration-emitting packages stay on 6

Date: 2026-11-08
Status: accepted

## Context

The 2026-11-08 dependency sweep moved every surface to current versions. TypeScript 7.0.2
(the native compiler) type-checks the whole repository cleanly, but it does not ship the
JavaScript compiler API (`parseJsonConfigFileContent` and friends) that tsup 9's
declaration bundler (`rollup-plugin-dts`) requires. The `@typescript/typescript6` compat
package only partially satisfies it — tsup's deeper d.ts path still imports `typescript`
directly and crashes.

`kernel-portal` never emits declarations: it runs `tsc -b --noEmit` plus a Vite build.
`@kernel/ui`, `@kernel/catalog`, and `@kernel/definitions` emit public `.d.ts` files via
tsup, so their toolchain is constrained by what tsup can drive.

## Decision

- `kernel-portal` and `kernel-studio-server` adopt whatever current stable TypeScript
  type-checks the code (7.0.2 today). They have no dts emit, so nothing couples them to
  the compiler API.
- `packages/ui`, `packages/catalog`, and `packages/definitions` pin `typescript ~6.0.3`
  until tsup (or its dts plugin) supports the TypeScript 7 native compiler. tsup itself
  is on 9.x everywhere.
- The split is intentional and temporary: when tsup's dts path works against TS 7, the
  packages move and this record is superseded.

## Consequences

- Two TypeScript versions exist in the repository on purpose. Type-checking behavior is
  compatible in practice (the same sources pass both), but any 7-only syntax adopted in
  shared `packages/*` sources would break the package builds — the package `check`
  scripts (tsc 6) guard this.
- Upgrade attempts that bump the package pins to 7 will fail in `ui:build` /
  `definitions:build` at the DTS step; that failure is expected, not a regression.
