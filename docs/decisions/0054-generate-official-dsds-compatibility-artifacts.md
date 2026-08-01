# 0054 — Generate official DSDS compatibility artifacts

- Date: 2026-08-01
- Status: accepted

## Context

Decision 0035 deliberately adopted selected Design System Documentation
Specification (DSDS) structures without adopting official DSDS documents. That
choice produced a useful Kernel-native component-documentation model and now
supports 81 records, a portal renderer, and source-parity gates. Replacing or
renaming it would create a second migration problem without improving Kernel's
authoring model.

External tools, however, need schema-valid official DSDS documents rather than
a DSDS-inspired internal shape. Kernel also models `element`, `object`, and
`domain` entities that official DSDS 0.15.2 does not define as top-level kinds.
Dropping those classifications would erase the domain model the design system
exists to document.

## Decision

Kernel's catalog, component documentation, foundations, and tokens remain the
canonical authoring sources. Official DSDS documents are deterministic generated
interoperability artifacts and are never maintained as a second hand-authored
source.

The compatibility contract is versioned in `scripts/ds/lib/dsds-contract.mjs`.
Kernel kinds map to official DSDS kinds as follows:

- `component` → `component`
- `pattern` → `pattern`
- `element` → `component`, because Kernel elements are documented interface
  building blocks rather than instructional content
- `object` → `pattern`, because Kernel objects describe reusable compositional
  solutions and workspace anatomy
- `domain` → `pattern`, because Kernel domain entities describe reusable,
  domain-specific interface solutions rather than procedural guides

Every export keeps the canonical Kernel kind and ID, package ownership, portal
anchor, source paths, and relationship records under
`extensions.com.kernel.catalog`. The official identifier is the stable canonical
Kernel entity ID. Unknown Kernel kinds are refused rather than guessed. A change
to this mapping table is an architecture change requiring a new decision.

Normal generation and validation use a pinned, vendored official schema. Network
access is reserved for explicit status and update operations; updates remain
reviewable and never commit or push changes automatically.

## Consequences

- Decision 0035 remains authoritative for Kernel's internal component-doc model;
  this decision supersedes only its conclusion that official DSDS document and
  manifest machinery is unnecessary for interoperability.
- Kernel can claim official DSDS compatibility only for generated artifacts that
  validate against the pinned official schema, not for its internal authoring
  records.
- Consumers can use official entity kinds while recovering Kernel's richer
  domain classification losslessly from the namespaced extension.
- Generated artifacts, mappings, schema provenance, and update behavior become
  tested contracts and reviewable diffs.
- Adding broader DSDS entities is allowed only when a canonical Kernel source
  exists; the generator must not synthesize foundations, tokens, themes, guides,
  or chunks merely to populate official kinds.
