# 0042 — UI package distribution contract

Date: 2026-07-30
Status: accepted

## Context

Kernel's public primitives still live in the portal source tree, so consumers cannot install a bounded artifact or rely on an intentional API. Packaging the portal itself is unsafe: its dry-run payload includes application code and deployment-owned files. The extraction needs a contract before canonical source ownership moves.

## Decision

Create `@kernel/ui` as an ESM-only workspace package with explicit root, marks, icon, utility, CSS, API-inventory, and package-manifest exports. Build JavaScript with the existing esbuild-based `tsup` stack and declarations with TypeScript. React and React DOM are peer-only externals; all other runtime imports must be declared dependencies.

Generate the root entry and `api.json` from the catalog-backed public inventory. Permit the first phase to compile the still-canonical portal source through a transitional build alias; the following phase must move those implementations into `packages/ui/src` and remove that alias before committing the extraction.

Package checks enforce declarations and CSS presence, explicit exports, declared externals, absence of portal source or bundled React in distribution files, and a payload allowlist. Tests include failing wildcard, private-source, and React-as-dependency fixtures plus a packed clean-install fixture that resolves one React version.

## Consequences

- Consumers get an intentional package surface before implementation ownership moves.
- Package payload and peer behavior are executable CI contracts rather than release-time assumptions.
- Minified distribution output removes build-time source path comments from the packed artifact.
- The portal and Studio remain independently installed applications.
- `kernel-app` remains outside managed package consumption.
