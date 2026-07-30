# 0044 — Definition contract package ownership

Date: 2026-07-30
Status: accepted

## Context

Kernel object models, workspace presets, composition doctrine, deterministic coordinate behavior, and representative fixtures were portal-owned even though Studio and external consumers need the same validation and serialization contracts. Keeping those contracts inside the deployed documentation application would make package consumers depend on application internals and risk validation drift.

## Decision

Move the canonical framework-free definition contracts into `packages/definitions` and distribute them as `@kernel/definitions`. The package has explicit root, composition, and preset entry points plus a generated API inventory. It owns object and workspace Zod schemas, parsers, boolean validation APIs, deterministic coordinate derivation, composition rules, and committed compatibility fixtures.

The portal consumes the package through a package-local `file:` dependency. Its former object contract modules remain only as narrow compatibility re-exports while portal-specific registries, fetching, persistence, and React hooks stay application-owned.

## Consequences

- `packages/definitions/src` is the canonical location for shared serialized definition contracts.
- Existing object and workspace JSON shapes, parser errors, and deterministic coordinate behavior remain compatible.
- Wildcard exports are forbidden and packed artifacts are independently buildable and testable.
- Studio can adopt the same package contract without moving filesystem or authoring behavior out of its existing boundaries.
- `kernel-app` remains an unmanaged vendored fork.
