---
name: kernel-ds-use
description: Consume the Kernel design system from an application — install @kernel/ui and @kernel/definitions, wire peer React, import styles, and use the intentional entry points. Use when building an app against the packages or wiring a new consumer.
triggers: consume the packages, install @kernel, use the design system, new consumer, packed tarball
user-invocable: true
---

# Kernel DS — consume the packages

## When to use

An application (inside or outside this repo) needs `@kernel/ui` components or `@kernel/definitions` contracts.

## Workflow

1. Install both packages. In-repo apps use `file:` dependencies (see `kernel-portal/package.json`); external consumers install packed tarballs produced by `npm run ds:pack` with `--write`.
2. React and React DOM are **peer** dependencies — the consumer provides exactly one React copy. `react-hook-form` is peer for form primitives.
3. Import only intentional entry points: `@kernel/ui` (root), `@kernel/ui/marks`, `@kernel/ui/icon`, `@kernel/ui/utils`, plus the stylesheet `@kernel/ui/styles.css`; `@kernel/definitions` (root), `@kernel/definitions/composition`, `@kernel/definitions/presets`. Never deep-import package source.
4. The public surface is inventoried in `packages/ui/api.json` and `packages/definitions/api.json` — consult those instead of guessing symbol names.

## Verification

- `npm run ds:pack` — payload allowlist and pack metadata for both packages.
- Consumer typecheck + production build must pass with a single React instance (the packed-consumer proof pattern).
