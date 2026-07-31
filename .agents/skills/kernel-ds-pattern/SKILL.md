---
name: kernel-ds-pattern
description: Register a UI pattern or element in the catalog and wire its relationships to components. Use for composition patterns, gallery patterns, or taxonomy relationship work.
triggers: add a pattern, new pattern, relate entities, relationship, composition pattern
user-invocable: true
---

# Kernel DS — patterns and relationships

## When to use

A reusable pattern/element entity, or typed relationships between catalog entities.

## Workflow

1. `npm run ds:add -- --kind pattern --name "<Name>"` (or `--kind element`) — package owner defaults to `kernel-portal` for gallery-rendered patterns.
2. Wire relationships with `npm run ds:relate -- --entity <id> --type <composedWith|dependsOn|usedBy|recommendedPatterns> --target <id>` — targets are validated against the catalog before anything is written.
3. Tags come from the closed taxonomy in `packages/catalog/src/taxonomy.ts`; apply with `npm run ds:tag`.
4. Portal gallery wiring follows the `kernel-feature` skill; keep example copy in the grain-buying domain.

## Verification

- `npm run catalog:check` — entity validity, adapter freshness, source resolution.
- `npm run ds:doctor` — relationship integrity and documentation readiness.
