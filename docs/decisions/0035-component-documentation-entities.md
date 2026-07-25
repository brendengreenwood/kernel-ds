# 0035 — Component documentation entities (DSDS-forked, parity-gated)

Date: 2026-07-24
Status: accepted

## Context

Component knowledge in the portal lived in four disconnected places, none of
them a documentation surface:

- `componentMeta` (`src/lib/component-meta.ts`) — lifecycle only (name,
  anchor, group, maturity, a11y, optional note).
- Gallery clusters (`gallery-*.tsx`) — demo groupings keyed by slug, no docs.
- `component-page.tsx` — rendered a `<Demo />` and a maturity pill, zero
  documentation content.
- ds-bundle prompt files — auto-generated, fully generic boilerplate (exports
  list + one canned usage line) for every component; a gitignored build
  artifact, not a source of truth.

None of these carried "use it like this, don't use it like that," none carried
machine-readable structure an agent could reason over, and nothing kept any of
it in sync with the component source. Documented claims that drift from the
code are worse than no docs — the `components-index.tsx` hardcoded name array
already demonstrates that class of rot.

DSDS (Design System Documentation Specification, designsystemdocspec.org)
defines a structured entity model for documenting design-system components —
typed document blocks, conformance levels, an extensions escape hatch.

## Decision

**A component doc is a typed entity, and its machine-readable claims are gated
against source.** The layer has three parts:

- A **DSDS-forked schema** (`src/lib/component-docs/schema.ts`). A
  `ComponentDoc` carries `id`/`name`/`slug`/`summary`, an optional `status`
  (reusing the existing `Maturity` taxonomy), an optional `sourceFiles` list,
  and a `docs` array of typed `DocBlock`s. Eight block kinds discriminate on
  `kind`: `guidelines` (dos/donts), `api` (props), `variants` (axis/keys/
  defaultKey groups), `anatomy` (slots), `states`, `accessibility` (role/
  aria/keyboard), `useCases` (use/dontUse), `decisions` (refs). Human prose
  lives in plain string/markdown fields; machine-checkable structure lives in
  the typed arrays the gate reads. Three conformance levels — Minimal,
  Documented, Complete — classify each entity.

- A **parity gate** (`scripts/check-component-docs.mjs`), modeled on
  `check-status-map.mjs`. For every doc entity it resolves the component
  source file(s) (from `sourceFiles`, defaulting to `${slug}.tsx`) and
  cross-checks: documented `variants` keys against the `cva` variant keys in
  source, documented `anatomy` slots against `data-slot="..."` attributes,
  and documented `api` prop names against string literals in source. Any
  divergence is an offender; the gate prints an enumeration and exits 1,
  exits 0 silently otherwise. A `--coverage` mode (used only at ship checks)
  additionally asserts every `ready` component has a doc entity.

- **Doc entities** under `src/lib/component-docs/<slug>.ts` with a barrel
  `index.ts` exposing a `componentDocs` map and `getComponentDoc(slug)`. This
  segment ships five: button, tabs, status-badge, card, scroll-area
  (documenting ScrollArea and Resizable together — the shared gallery slug),
  and input (a Minimal-conformance entity that proves the no-cva path).

The portal renders these via `ComponentDocSections` on the component page,
between the member pills and the demo; undocumented components fall back
gracefully to demo-only. ds-bundle prompt-guidance is generated from the same
entities rather than hardcoded strings.

## Fork, not verbatim adoption

DSDS's RichText format (nested typed-node arrays), its 17 document block
kinds, and its `$schema`/`$ref`/manifest pattern duplicate machinery we
already own: our prompt guidance is already markdown, the portal renders
React, and the definitions loader already owns a manifest. We keep DSDS's
*structural* patterns — typed document blocks, conformance levels, the
`extensions` escape hatch — and use plain strings/markdown for human content
plus our existing `Maturity` model for status. Our schema is a subset of
DSDS; a bridge (Storybook/Figma interop) is straightforward if ever wanted,
and is deliberately out of scope here.

Rejected alternatives:

- **DSDS verbatim** — carries 17 block kinds we would use a third of, a
  RichText format we would convert markdown → RichText → React for no gain,
  and a manifest pattern that duplicates the definitions loader.
- **Big-bang all components at once** — the schema and gate must be proven on
  diverse shapes (single-axis cva, multi-axis cva, no-cva, subcomponents-only,
  shared-slug) before scaling. The six source shapes in this slice cover every
  extraction case the gate must handle; full coverage follows in segment 02
  with the gate catching authoring errors.
- **Docs without a parity gate** — the explicit requirement is machine-readable
  data that stays in sync with source. Without a gate, docs drift from reality
  — the exact problem this layer exists to solve. The gate is the core of the
  decision, not an add-on.

## Parity is a claim check, not a type system

The gate is a regex/source cross-check, not a TypeScript type-level analysis.
Variant-key and slot checks are the high-value assertions — they catch the
common authoring error (documenting a variant or slot that no longer exists).
Prop-name parity is a weak name-presence guard: a documented prop name must
appear as a string literal in the source. Full type-level prop parity would
require a compiler (`ts-morph`), a dependency deliberately kept out of scope.
Where a documented prop spreads through to Base UI / Radix and is not a literal
token in our thin wrapper (e.g. `card.children`, `scroll-area.direction`), it
is dropped from the `api` block and its guidance kept in `guidelines` — the
gate working as intended, keeping the machine-readable claims honest.

## `agentDocs` — schema-present, content-deferred

The entity carries an `agentDocs` array (a permissive placeholder this
segment). The field exists so that scaling to richer machine-facing content
later needs no breaking schema change; its content is deferred to a follow-up.

## Arc position

0030 (objects arrive as JSON) → 0031 (labels from model) → 0032 (workspaces
arrive as JSON) → 0034 (definitions persist as files) → **0035 (components
document themselves as typed entities, gated against their own source)**.
Where 0030–0034 made the *object/workspace* layer data-driven and validated,
0035 does the same for the *component vocabulary*: a single structured layer
that humans read in the portal, agents read as machine data, and a parity gate
keeps honest.

## Deliberately deferred

- **Full coverage.** This segment ships five entities to prove the stack on
  diverse shapes; the remaining `ready` components and `--coverage`
  enforcement follow in segment 02.
- **`agentDocs` content.** Schema-present, content-deferred (above).
- **DSDS interop bridge.** Storybook/Figma interop is out of scope; the schema
  is a DSDS subset so a bridge stays possible.
- **`componentMeta.note` generation from entities.** The doc entities now hold
  richer guidance than the ad-hoc `note` field; regenerating `note` from them
  is a follow-up, not this decision.
