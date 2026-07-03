# 0006 — Component lifecycle statuses and Primer-style side rail

Date: 2026-07-04 · Status: accepted

## Context

As the system grows, consumers need to know what they can rely on. GitHub's
Primer does this well: a three-tier component lifecycle
(Experimental / Ready / Deprecated), per-component entries in the docs side
rail, and a status overview page. Kernel had neither per-component
navigation nor any maturity signal — everything looked equally "done",
including the four components carrying flagged Base UI behavior deltas
(decision 0005) and a domain pattern whose API is still settling.

## Decision

Adopt a Primer-style three-tier lifecycle — **experimental / ready /
deprecated** — tracked in a single registry
(`kernel-portal/src/lib/component-meta.ts`) that drives both the side rail
and a new **Component status** section, mirrored on both surfaces.

- **experimental** — usable, but behavior or API may still change; the
  status page's note says exactly what is open.
- **ready** — long-term support expected; breaking changes ship with
  migration guidance.
- **deprecated** — will be removed; the note names the replacement.

Accessibility review is tracked as a separate dimension (`reviewed` /
`pending`), not folded into maturity — all entries are `pending` until the
backlog's a11y pass runs, and the status page says so plainly.

The side rail becomes Primer-style: the Components group lists every
component individually (linking to in-page anchors on the demo subheads),
with a small maturity pill on anything not ready. Form
elements/Tables/Charts move to an **Elements** group.

**Taxonomy discipline:** maturity is a third color taxonomy and must not be
confused with domain statuses (decision 0003) or notification variants. It
uses a deliberately quiet treatment — outline pills and dotted text labels
inked from the notification scales, never the `--status-*` tokens and never
the StatusBadge component.

## Consequences

- Honest statuses on day one: tabs, dropdown-menu, context-menu, menubar,
  navigation-menu are `experimental` until the Base UI behavior deltas are
  signed off; contract-detail is `experimental` until the domain-pattern
  lineup settles. Signing off a delta means flipping the registry entry to
  `ready` and deleting its note.
- Adding a component now requires a registry entry (name, anchor, group,
  maturity, a11y) — the status page and rail update from it on both
  surfaces per the CLAUDE.md mirroring rule.
- The a11y pass (backlog #3) has a visible scoreboard: flipping `pending`
  → `reviewed` per component.
