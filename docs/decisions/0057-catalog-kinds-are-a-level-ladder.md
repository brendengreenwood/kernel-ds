# 0057 — Catalog kinds are a level ladder

Date: 2026-08-02
Status: accepted

## Context

The catalog's `entityKinds` taxonomy has always listed five kinds — `component`,
`element`, `object`, `pattern`, `domain` — but nothing in the repository stated that
they mean anything relative to each other, and the data showed it. Both domain
entities, `domain.contract-detail` and `domain.settlement-statement`, had shipped
with empty `relationships` and empty `sourceFiles`: registered names that pointed at
no implementation and claimed no composition, while the portal routes implementing
them had existed for months. `entityTags` compounded the flatness by mirroring
exactly the kind names plus the maturity names, so the only tag axis carried no
information beyond fields that already existed.

At the same time the portal contained upper-level structures that were built,
reused, and never registered: the expandable-row treatment in
`portal/tables.tsx` and the page section wrapper in `portal/section.tsx`. The v2
prototype independently built the same expandable row twice before extracting it
(drift 5.5), which is the same signal arriving from a second consumer.

Read as a flat set of labels, `kind` answers "what sort of thing is this" and
nothing else. Read as a ladder it answers "what is this made of, and what is it
part of" — which is the question the catalog exists to answer.

## Decision

The five kinds are ordered levels of composition, not interchangeable labels.
`component` and `element` are interface building blocks; `object` is a reusable
compositional unit with its own anatomy; `pattern` is a solution shape; `domain` is
a named product surface built out of the levels below it.

Three rules follow.

**Registration at object level and above requires a referent and a relationship.**
An entity at `object`, `pattern`, or `domain` level must cite `sourceFiles` that
resolve to a real implementation and wire at least one relationship. A name with
both fields empty is a placeholder, not a catalogued entity. `catalog:check`
already resolves `sourceFiles`; the relationship half of this rule is currently a
convention rather than an enforced gate.

**Extraction precedes registration.** Something built twice and reused is an
entity whether or not anyone has registered it. Registering it names what already
exists; it does not create a new abstraction, and it is not a licence to invent one.

**Level relations flatten, visibly, until the vocabulary carries them.** Kernel's
`relationshipTypes` is `composedWith | dependsOn | usedBy | recommendedPatterns`,
which cannot express containment or specialisation. A domain that specialises an
object is written `dependsOn`, and a row contained by a domain's table is written
`composedWith`. Where a relation is knowingly the wrong one, the worklog entry
records which relations are approximations and why. The flattening is never
silently absorbed as though it were the intended model.

This decision does not add `part-of` or `extends`, and does not create catalog
entities for DSDS's `foundation`, `theme`, `token`, `token-group`, `guide`, or
`chunk` kinds. Decision 0063's prohibition on synthesizing kinds merely to populate
the official taxonomy stands.

## Consequences

- Catalog moves to 95 lifecycle entries and 83 documentation records. The pinned
  counts in `kernel-portal/scripts/check-catalog.mjs` move with every registration;
  that gate is a claim check and the claim has to be updated deliberately.
- Four relations in the catalog are recorded approximations, listed in the
  2026-08-02 worklog entry. They are load-bearing data, so adding `part-of` and
  `extends` later means revisiting them, not just widening the union.
- The ladder is lossy on export. Decision 0063 maps `element` → `component` and both
  `object` and `pattern` and `domain` → `pattern`, so three Kernel levels collapse into
  one DSDS kind. Consumers reading generated artifacts cannot see the ladder;
  consumers reading `$extensions.com.kernel.catalog` can. This is a known limit of
  the compatibility layer, not a defect in it, and it is a reason the level
  information has to be carried by relations rather than by kind alone.
- The DSDS compatibility contract is unchanged and stays at version 2. Nothing here
  alters the mapping table, which decision 0063 protects behind a new decision.
- The v2 prototype still cannot own entities: `packageOwners` is
  `kernel-portal | @kernel/ui | @kernel/definitions` and `kernel-app` is fenced as
  an unmanaged consumer under decision 0036. The objects and domains it has already
  built have nowhere to be registered. Tracked as an open question in STATE.
- Number 0056 is deliberately skipped here. It is taken on the
  `claude/kernel-insider-portal-fvqfq2` branch by the prototype's forward-design-track
  decision, which is not yet merged. Skipping avoids adding a fourth duplicate to
  the existing 0040/0041/0042 collisions.
- Adding, removing, or reordering the levels is an architecture change requiring a
  new decision. Adding a relation type to carry them is as well, because it changes
  the export contract.
