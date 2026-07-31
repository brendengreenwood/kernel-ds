# 0043 — UI source package ownership

Date: 2026-07-30
Status: accepted

## Context

Decision 0042 established the distributable `@kernel/ui` contract while canonical implementations still lived in the portal. Keeping that transitional source dependency would leave the package coupled to an application tree and preserve duplicate ownership once the portal began consuming the package.

## Decision

Move the canonical UI implementations, marks, mobile hook, utility, and CSS source into `packages/ui/src`. The portal consumes explicit `@kernel/ui` entries through a package-local `file:` dependency and no longer owns a parallel `src/components/ui` implementation tree.

Catalog source references and package ownership identify `@kernel/ui`. Component-document verification and `ds-bundle` generation resolve source from the package. React and React DOM remain peer-only, and the independently installed portal keeps its own lockfile and deployment commands.

## Consequences

- `packages/ui/src` is the only canonical implementation location for public UI primitives.
- Portal imports exercise the same public package entries used by external consumers.
- Documentation parity, catalog integrity, and Studio bundle generation follow package-owned source paths.
- The portal lint count drops when moved source leaves its application-only lint scope; package build and contract gates cover the package boundary.
- `kernel-app` remains an unmanaged vendored fork.
