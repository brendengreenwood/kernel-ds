# 0001 — Docs system: living state + append-only memory

Date: 2026-07-03 · Status: accepted

## Context

The project had no documentation of intent. Git history shows what changed
but not why, and there was no single place describing the current state of
the system. As sessions accumulate, the reasoning behind choices gets lost.

## Decision

Adopt a four-part docs system under `docs/`:

- `STATE.md` — living document of what is true now (edited in place)
- `worklog/YYYY-MM.md` — append-only what/why entries per change
- `decisions/NNNN-*.md` — immutable records of shaping choices (this format)
- `archive/` — date-stamped cold storage for retired STATE content

Maintenance is part of every change (enforced via `CLAUDE.md`), not a
separate chore. Decision records are superseded by new records, never edited.

## Consequences

- Every meaningful change costs one worklog entry and a STATE check — small,
  constant overhead.
- STATE.md must be actively pruned (via `archive/`) to stay readable.
- Future sessions can reconstruct both current reality and historical intent
  without archaeology through git log.
