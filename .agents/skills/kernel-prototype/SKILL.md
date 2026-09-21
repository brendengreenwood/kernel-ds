---
name: kernel-prototype
description: Work conversationally across Figma and kernel-app while recording concern-level discoveries in the DSDS-linked prototype registry and guarding promotion into canonical packages. Use for Figma prototype changes, kernel-app workflows or real contract data, prototype-only decisions, and promotion requests.
triggers: figma panel, figma prototype, kernel-app, real contract data, prototype-only, promote this component, promote this contract, prototype workflow
user-invocable: true
---

# Kernel — prototype discovery and promotion

Use this ritual whenever work touches Figma, `kernel-app`, prototype data/workflows, or promotion. The user can speak normally; registry and CLI bookkeeping are agent infrastructure, not a form the user must operate.

## Start the session

1. Run `npm run ds:prototype -- check` and `npm run ds:prototype -- status`.
2. If Figma is involved, run the live bridge probe described in `docs/figma/GUIDE.md`: resolve every projected entity and child node ID with `figma.getNodeByIdAsync`, report missing nodes, and repair recovery drift before new edits.
3. Identify the existing catalog entity IDs, scope key, and concern before editing. Concerns are `visual`, `component`, `pattern`, `object-model`, `workflow`, and `data`. Do not invent a second identity system.

## Work conversationally

1. Ordinary user direction is sufficient to create or update an initiative. Use `npm run ds:prototype -- add`, `link`, and `set` in the same turn as the Figma or `kernel-app` work; do not ask the user to maintain `docs/prototypes/registry.json` manually.
2. Figma and `kernel-app` are peer discovery surfaces, not canonical shipped authorities. Keep the initiative concern-specific: a promoted component does not promote the whole screen or its workflow.
3. Real workflow and contract-data work may be implemented in `kernel-app`. Reusable schemas, fixture-schema/factory rules, derivation contracts, object models, and workflows may become `@kernel/definitions`; sample records, scenario datasets, persistence, runtime adapters, product datasets, and integrations stay app-local or become `prototype-only`.
4. Promoted ownership is fixed: `visual`, `component`, and `pattern` require shipped `@kernel/ui` evidence; `object-model`, `workflow`, and `data` require `@kernel/definitions` evidence.
5. Validate CSS cascade, `color-mix`, media queries, focus behavior, animation, and runtime data in the browser. Figma is not the renderer.

## Promotion guard

A request to explore, implement, validate, or keep prototype-only is ordinary direction. Marking a concern `promoted` additionally requires explicit tuple-specific acceptance plus already-committed canonical implementation evidence. Never infer acceptance from an actor name, generic approval, completed-looking UI, or sample data. Without acceptance, stop at `validated` and report what is ready.

For newly implemented canonical work, use three commits:

1. Implement and verify canonical code, then commit it.
2. Resolve that immutable SHA, write the tuple-specific acceptance artifact under `docs/prototypes/acceptances/`, and commit the artifact.
3. Run the `validated → promoted` transition against both committed artifacts, run `npm run ds:generate`, verify projections, and commit the registry plus generated projections.

Promotion records completed canonical work; `ds:prototype` never rewrites `@kernel/ui` or `@kernel/definitions` automatically.

## Finish the turn

1. Run `npm run ds:generate` to refresh `docs/prototypes/status.md` and the generated Figma compatibility map.
2. Run `npm run ds:prototype -- check` and the narrow browser/package gates for the changed surface.
3. Update `docs/STATE.md` and `docs/worklog/2026-09.md` in the same turn. Preserve `docs/v2-prototype-drift.md` as historical rationale.

## Verification

- `npm run skills:check` validates this protocol and its conversational routing fixtures.
- `npm run ds:prototype -- check` must report current registry and projections.
- `npm run ds:doctor` must report 0 violations.
- Browser verification is required for CSS/runtime behavior; Figma-only inspection is insufficient.
- Before shipping guidance changes, run `npm run agents:generate` and `npm run agents:check`.
