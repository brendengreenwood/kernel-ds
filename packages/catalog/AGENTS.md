# Catalog package

`@kernel/catalog` is the canonical inventory for Kernel design-system entities. Portal metadata, documentation navigation, Studio intelligence, release impact data, and generated inventories must derive from this package rather than maintain parallel registries.

## Boundaries

- Keep catalog data framework-free and safe to import from Node tooling.
- Entity IDs are stable lowercase kebab-case identifiers prefixed by kind, such as `component.button` or `pattern.advanced-filtering`.
- Use the closed taxonomies in `src/taxonomy.ts`; do not add free-form lifecycle states or relationship types.
- Every relationship target must resolve to another catalog entity.
- Package ownership and public entry points are explicit. Do not use wildcard exports.
- `src/entities.ts` is the canonical entity inventory. Edit it when registering lifecycle metadata, then run `npm run catalog:generate` to refresh derived adapters.
- `kernel-portal/src/lib/component-meta.generated.ts` is generated. Never edit it directly.

## Verification

Run from the repository root:

```bash
npm run catalog:test
npm run catalog:check
node kernel-portal/scripts/check-catalog.mjs
```

<!-- kernel-ds:generated:start -->
## Generated inventory (do not edit — regenerate with `npm run agents:generate`)

- Entities: 95 — by kind: component 62, domain 2, element 6, object 15, pattern 10
- By maturity: experimental 13, ready 82
- By package owner: @kernel/definitions 7, @kernel/ui 60, kernel-portal 28
- Documentation records: 83
<!-- kernel-ds:generated:end -->
