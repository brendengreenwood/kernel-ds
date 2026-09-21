# 0070 — Prototype discovery and promotion authority

Date: 2026-09-20
Status: accepted
Supersedes in part: 0056 (the categorical statement that product behaviour never promotes)
Amends and reaffirms: 0068 (`kernel-app/` is a maintained, non-authoritative prototype surface), 0022 (single shipped documentation surface)

## Context

Decision 0056 correctly made prototype drift deliberate and reviewable, but its statement that product behaviour does not promote is too broad. Real interface work can uncover reusable object relationships, workflow states, validation rules, derivations, and data contracts. Refusing those discoveries categorically leaves the design system able to promote visual treatment while forcing each consumer to rediscover the contracts that make the treatment truthful.

Figma and `kernel-app/` now provide complementary kinds of evidence. Figma is strong at spatial composition, component anatomy, variants, and visual proposals. `kernel-app/` is strong at executable interaction, realistic density, workflow, and data-model validation. Neither surface is a shipped authority merely because a discovery originated there.

## Decision

**Figma and `kernel-app/` are peer prototype surfaces. Either may originate a proposal, while canonical packages remain the authority for shipped contracts. Promotion is explicit, concern-specific, evidenced, and recorded against stable catalog entity IDs.**

Consequences:

- Discovery authority and shipped authority are separate. Prototype work may be authoritative evidence for a proposal without becoming canonical until the relevant package changes, verifies, commits, and records promotion.
- Visual, component, and pattern discoveries promote through shipped `@kernel/ui` implementation evidence. Catalog relationships and portal documentation may accompany that work, but they are not substitutes for the implementation.
- Object-model, workflow, and contract-data discoveries may promote through framework-free `@kernel/definitions` contracts after validation. This supersedes only 0056's categorical prohibition; invented demo behaviour remains non-authoritative.
- The `data` concern is narrow: reusable schemas, fixture-schema or fixture-factory contracts, and deterministic derivation contracts. Sample records, scenario datasets, persistence, runtime adapters, product datasets, and integrations remain application-local unless separately governed.
- Prototype status is tracked per concern. A screen or initiative is never globally “promoted” because one token, component, or contract landed.
- Promotion requires explicit acceptance plus immutable canonical evidence. Agents must not infer or fabricate user acceptance. Newly implemented canonical work follows three commits: canonical implementation, committed tuple-specific acceptance, then registry/projection promotion.
- `kernel-app/` remains an unmanaged consumer under decision 0036. This decision does not make it a release target, package owner, product application, or canonical implementation location.
- Decision 0068 is reaffirmed: `kernel-app/` is maintained and built by CI, but its screens, copy, sample data, persistence, and runtime behaviour are not automatically specifications. Its validated discoveries become authoritative only after promotion to a canonical owner.
- Decision 0022 remains in force. `kernel-portal` is the sole shipped documentation surface; Figma and `kernel-app/` are prototype surfaces, not competing shipped surfaces.
- Prototype identity reuses the catalog. The registry may attach volatile surfaces and lifecycle evidence to catalog IDs but may not establish a second entity taxonomy.

## Operational contract

The canonical operational ledger is `docs/prototypes/registry.json`, validated by framework-free tooling under `scripts/ds/prototype/`. It records stable initiatives, typed scopes, peer surface references, concern-level state, append-only transition history, acceptance artifacts, and immutable canonical evidence. Kernel's DSDS compatibility output projects relevant initiative IDs and concern states under `$extensions["com.kernel.prototype"]`; the vendored upstream schema is not modified.

`promoted` is terminal for a concern in an initiative. Reconsideration creates a superseding initiative instead of rewriting history. Prototype-only decisions and rollbacks require an audit reason. Unavailable retained Git history is a non-success verification state, never evidence that promotion succeeded.

## Verification

The registry validator rejects unknown catalog IDs, invalid surface references, duplicate active entity/concern/scope tuples, unresolved retired initiatives, incomplete history, wrong promotion owners, and promoted concerns without acceptance and canonical evidence. Transition tests cover every allowed and illegal edge. Canonical-evidence tests verify committed acceptance artifacts, public exports or typed contract members, source paths and package ownership at the referenced commit, and distinct shallow/unavailable-history handling.
