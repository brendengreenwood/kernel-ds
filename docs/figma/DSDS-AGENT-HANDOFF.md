# DSDS handoff for Figma and design-system agents

This document is the shared operating brief for the agent working in Figma and the agent working in the design-system repository. Read it before attempting to synchronize the Kernel DS library, a DSDS-informed product design, or canonical package code.

## Shared objective

Use DSDS as the identity and relationship layer across three surfaces:

1. **Canonical repository** — catalog identity, shipped UI, reusable definitions, CI, and release ownership.
2. **Kernel DS Figma library** — reusable variables, styles, components, variants, and published component keys.
3. **Product design or executable prototype** — compositions, workflows, realistic data, and discoveries that may become candidates.

The goal is not automatic bidirectional overwrite. The goal is that either agent can determine what an artifact is, where its shipped authority lives, how its representations differ, and what evidence is required before accepted work moves into a canonical package.

## Authority model

- `packages/catalog` owns stable entity identity and relationships.
- `@kernel/ui` owns promoted visual, component, and pattern contracts.
- `@kernel/definitions` owns promoted object-model, workflow, validation, and reusable contract-data contracts.
- Figma and executable prototypes are peer discovery surfaces. Either may lead a proposal; neither is silently canonical.
- Sample records, scenario datasets, persistence, adapters, product datasets, and integrations remain application-local unless separately governed.
- Promotion is concern-specific. Promoting one component or data contract does not promote the whole screen or workflow.

## Join key

The stable join key is the existing catalog/DSDS entity ID, for example `component.button`, `component.sidebar`, or `object.workspace`.

Do not use a Figma node ID, component key, source path, display name, or route as a replacement identity. Those are surface references attached to the entity ID.

A mapped artifact should resolve to information equivalent to:

```json
{
  "entityId": "component.button",
  "dsdsKind": "component",
  "canonicalOwner": "@kernel/ui",
  "source": "packages/ui/src/components/ui/button.tsx",
  "surfaceStatus": "candidate"
}
```

Persist identity in the repository registry and, where practical, in visible Figma descriptions or annotations. Published component keys and node IDs belong in surface mappings, not in a second entity taxonomy.

## What synchronization means

A synchronized system can answer:

1. What catalog entity is this artifact?
2. Which concern is being examined: `visual`, `component`, `pattern`, `object-model`, `workflow`, or `data`?
3. Which package owns the shipped contract?
4. Where are its code, Figma-library, product-design, and prototype representations?
5. Are those representations equivalent for the selected concern?
6. If not, is the difference stale drift, a deliberate compromise, or a candidate discovery?
7. Which direction should an accepted change move?
8. What verification and acceptance prove that the synchronization occurred?

Synchronization does **not** mean that every surface is pixel-identical or that the newest edit wins.

## Responsibilities of the Figma agent

1. Start with a read-only inventory of variables, styles, components, component sets, properties, annotations, descriptions, node IDs, and published keys.
2. Resolve or propose a catalog entity ID before modifying a reusable artifact. Do not create an orphan component identity.
3. Treat the existing Kernel DS library as an import candidate, not automatically as canonical. Classify artifacts as `matched`, `partial`, `stale`, `exploration`, `unmapped`, or `duplicate`.
4. Preserve component anatomy, variants, properties, token bindings, and relationships when reporting differences. A name match alone is insufficient.
5. Record Figma node IDs and component keys through the prototype registry workflow; never hand-edit the generated Figma map.
6. Do not claim browser/runtime equivalence for CSS cascade, `color-mix`, media queries, focus behavior, animation, responsive behavior, or live data.
7. Before destructive work, verify the connected file, capture the current state, and live-probe mapped nodes for deletion drift.
8. Return a reconciliation report before rebuilding or bulk-updating the library.

## Responsibilities of the design-system agent

1. Resolve every proposed mapping against the existing catalog. Add a catalog entity only when the concept is genuinely missing, not merely because a Figma artifact is unmapped.
2. Verify canonical ownership, source paths, public exports, and package contracts in the repository.
3. Compare Figma findings with the implementation rather than assuming code or canvas is visually complete.
4. Route promoted concerns correctly: visual/component/pattern to `@kernel/ui`; object-model/workflow/data to `@kernel/definitions`.
5. Keep application-specific persistence, adapters, integrations, and sample datasets outside reusable definitions.
6. Use `ds:prototype` for concern lifecycle and surface references. Ordinary user direction can create or advance prototype work, but promotion requires explicit tuple-specific acceptance and committed canonical evidence.
7. Regenerate projections and run the relevant repository, browser, and package gates after accepted synchronization work.

## First reconciliation pass

The first pass must be read-only:

1. Extract the repository's current catalog/DSDS identities and canonical owners.
2. Extract the Kernel DS library's variables, components, properties, descriptions, annotations, node IDs, and keys.
3. Extract the DSDS-informed product design's persisted entity metadata and component/library relationships.
4. Produce a table with at least:

| Entity | Canonical code | Kernel DS library | Product design/prototype | Current authority | Drift | Recommended action |
| --- | --- | --- | --- | --- | --- | --- |

5. Classify each row as an exact identity match, known entity with drift, Figma-only candidate, code-only implementation, renamed/superseded entity, duplicate, or ambiguous/unmapped artifact.
6. Do not mutate any surface until ambiguous mappings and the proposed direction of synchronization are reviewed.

## Safe first vertical slice

Prove the bridge with one entity before attempting broad synchronization. A useful slice includes:

1. one catalog entity such as `component.button`, `component.sidebar`, or `object.workspace`;
2. its canonical package implementation;
3. its Kernel DS library component or frame;
4. its instances or composition in the DSDS-informed product design;
5. a comparison of properties, variants, token bindings, anatomy, and behavior;
6. one explicitly approved synchronization direction;
7. verification across Figma, code, and browser/runtime where applicable.

Only scale the process after this slice demonstrates that identity survives the round trip and that drift is classified correctly.

## Promotion and refusal rules

- An attractive or complete-looking Figma component is still a proposal until accepted and implemented canonically.
- Working prototype behavior or realistic sample data is not automatically a reusable contract.
- Never infer acceptance from an actor name, generic approval, existing UI copy, or a successful demo.
- Never overwrite both directions in one operation. Select a source and target for the specific concern.
- If identity is ambiguous, stop and report the candidate mappings.
- If a change conflicts with the work repository's CI, release, audit, or ownership model, preserve those constraints and adapt the operating model rather than transplanting local tooling wholesale.

## Repository commands

The design-system agent uses:

```bash
npm run ds:prototype -- check
npm run ds:prototype -- status
npm run ds:generate
npm run ds:figma
npm run ds:doctor
```

The Figma agent follows the live-probe and bridge mechanics in `docs/figma/GUIDE.md`. Both agents use `.agents/skills/kernel-prototype/SKILL.md` for concern routing, same-turn registry updates, and promotion guards.

## Required handoff between agents

When handing work to the other agent, include:

- catalog entity ID and concern;
- originating surface and requested synchronization direction;
- Figma file, node IDs, component keys, and relevant annotations;
- canonical package, source path, and public symbol when known;
- exact observed drift, not only a screenshot or general description;
- state (`exploration`, `candidate`, `validated`, `promoted`, or `prototype-only`);
- verification already performed;
- unresolved identity or authority questions;
- whether explicit promotion acceptance exists.

The receiving agent must re-verify its own surface. A handoff is evidence, not permission to bypass validation or promotion guards.

## Short brief to give either agent

> Use `docs/figma/DSDS-AGENT-HANDOFF.md` as the shared authority model. DSDS/catalog IDs are the join keys; canonical packages own shipped contracts; the Kernel DS library and product designs are discovery representations. Begin read-only, reconcile identity and concern-level drift, choose one synchronization direction, and require explicit acceptance plus committed canonical evidence before recording promotion.
