# 0095 — Freshness and version history are library pieces

- Status: accepted
- Date: 2026-11-09

## Decision

Two things the Pricing scenario page was drawing by hand become `@kernel/ui`
components, both experimental:

- **`Freshness`** — whether market data is still inside its stale limit. One
  axis, `state`: `fresh` (muted) or `stale` (warning). A clock glyph plus a
  text label, rendered as inline text, not a pill.
- **`VersionHistory`** — the saves of one object, newest first. An ordered
  list of `VersionHistoryItem` rows, each with a label, a summary, and a meta
  slot. `current` marks the live version with `aria-current="true"`.

## Why

- The Pricing scenario page hand-rolled a `stale` span and a versions list.
  That is the local patch the library rule forbids, on the flagship domain
  page.
- Staleness is not a status. A published scenario stays published while its
  Posted Bid Date goes stale underneath it, so it cannot be a `StatusBadge`
  key (decision 0092 keeps that ledger to lifecycles). It needs its own piece.
- Every save of a scenario is a version of the same scenario. Any object with
  that rule needs the same list, so it belongs in the library once.

## Not decided here

- `Freshness` does not compute anything. The business-day count against the
  CBOT grain calendar is the caller's job and is still an open question.
- `VersionHistory` carries no author or per-version status. Add them when the
  domain defines them.
- A "never stale" state for the Far band. Today the caller renders nothing.

## Consequences

- Both are deferred from the Figma library scope
  (`FIGMA_DEFERRED_COMPONENTS`), like Panes, until they are drawn there.
- Catalog: 107 entities, 94 documentation records.
- The Pricing scenario page and the gallery consume the components; no local
  stale markup remains.
