# 0078 — Code-to-Figma component integration manifest

Date: 2026-09-27 · Status: accepted

## Context

Kernel's canonical `@kernel/ui` package owns 62 catalog-backed component entities, while the Kernel DS Figma file contains only a partial reusable library. The existing Figma map is a compatibility projection of prototype lifecycle records, not a complete migration ledger. It can identify mapped nodes, but it does not describe every canonical component, distinguish drift from absence, or block migration until variants, properties, semantic token bindings, accessibility, and page-level placement have been verified.

That gap allowed a canonical Input instance to bring a legacy 14px `radius/lg` binding into the workspace composition even after the code geometry contract had moved controls to `radius/control` at 4px. A real component instance is not sufficient evidence that its inherited contract is current.

## Decision

Add `docs/figma/component-integration.json` as the versioned code-to-Figma integration manifest for catalog-owned `@kernel/ui` components. Generate it deterministically from the catalog, the public package API inventory, and the current Figma compatibility map with `scripts/ds/figma/build-component-integration.mjs`.

The manifest is keyed by DSDS catalog entity ID and records, for every canonical component:

- canonical source files, documentation, maturity, and public module;
- current Figma node/key/page/section mapping when one exists;
- integration status (`not-started`, `drifted`, or `mapped`);
- extracted variant, component-property, and required-token contracts, including an explicit pending state when those contracts have not yet been read from code;
- lifecycle authority and the verification evidence still blocking promotion.

The integration direction is code to Figma. Catalog identity, `@kernel/ui` contracts, and code tokens remain authoritative. Existing Figma artifacts are marked `drifted` until their live structure and bindings pass the same contract; they are not treated as complete merely because a map entry exists.

A component cannot leave exploration until variant/property parity, semantic token bindings, accessibility, and both targeted and full-page layout verification are complete. The manifest forbids legacy-radius inheritance, hardcoded semantic colors, orphan component identities, opportunistic canvas placement, and silent lifecycle promotion.

## Consequences

- Full-library integration has a finite, reviewable ledger: 62 catalog-owned components rather than an open-ended canvas exercise.
- Missing contract extraction remains visible instead of being guessed; pending fields block promotion.
- `figma-map.json` remains the generated prototype compatibility projection and is not repurposed as the migration plan.
- The current Button, Input, and Sidebar mappings begin as `drifted`; the remaining 59 components begin as `not-started`.
- Deterministic freshness and binding checks must be added before the manifest can serve as a CI gate.
- Non-catalog public modules (`code-block`, `direction`, and `input-group`) are reported but are not assigned new Figma identities without a catalog decision.
