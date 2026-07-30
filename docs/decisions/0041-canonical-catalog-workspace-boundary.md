# 0041 — Canonical catalog and workspace boundary

Date: 2026-07-29
Status: accepted

## Context

Kernel DS had two independently installed applications and no package boundary. Lifecycle metadata lived in `kernel-portal/src/lib/component-meta.ts`, documentation registration lived in the component-docs barrel, composition rules lived under the object model, and Studio intelligence was generated from portal source discovery. That fragmentation could support the portal, but not versioned UI and definition packages, generated consumer guidance, or reliable release impact metadata.

The portal and Studio also have distinct deployment and development ownership. Turning both applications into root workspace members would rewrite established lockfiles and package-local commands before package extraction provides any value.

## Decision

Create a minimal private npm workspace whose members are limited to `packages/*`. Keep `kernel-portal` and `kernel-studio-server` outside that workspace with their existing lockfiles and package-local commands.

Establish `packages/catalog` as the canonical typed inventory for components, patterns, elements, objects, and domains. The catalog owns stable kind-prefixed IDs, closed taxonomy values, lifecycle and accessibility status, package ownership, source/documentation/AI references, capabilities, and typed relationships. Its generated `entities.ts` is produced deterministically from the current lifecycle registry, the registered documentation barrel, pattern documentation, and composition contract until the portal is switched to catalog-derived metadata.

The root workspace supplies only catalog orchestration and a workspace lockfile. CI verifies catalog tests, TypeScript integrity, source resolution, baseline counts, and deterministic freshness without absorbing either application.

## Consequences

- Package extraction can proceed from one typed entity inventory instead of copying portal registries.
- Portal rendering and Studio behavior remain unchanged during the foundation phase.
- `packages/catalog/src/entities.ts` is generated and must not be edited directly.
- The portal lifecycle registry remains a temporary migration input only; the next phase replaces it with a catalog-derived adapter so duplicate canonical data does not remain.
- `kernel-app` remains the unmanaged vendored fork described by decision 0036.
