# 0002 — System font stacks only (no web fonts)

Date: 2026-07-03 (recorded retroactively; in force since initial build) · Status: accepted

## Context

Design systems commonly ship a branded web font (Inter, Roboto Mono, etc.),
which adds load weight, FOUT/FOIT handling, licensing considerations, and a
`next/font` or `<link>` dependency per surface.

## Decision

`--font-sans` and `--font-mono` are **native system stacks only**. No web
fonts, no `next/font`, no `<link>` font tags, and no serif family anywhere in
the system.

## Consequences

- Zero font network cost; identical setup in the static preview and the Vite
  build with no loader machinery to keep in sync.
- Typography renders slightly differently per OS — the type scale is designed
  to tolerate that.
- Any future branded-font request must supersede this record and update every
  surface listed in the CLAUDE.md sync rules.
