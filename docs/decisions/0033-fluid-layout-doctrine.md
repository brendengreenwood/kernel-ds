# 0033 — Fluid layout doctrine: no fixed column grid

Date: 2026-07-22 · Status: accepted

## Context

Auditing the foundation pages against the token layer surfaced that layout
had no documentation at all — no breakpoint reference, no grid guidance, no
content-measure rule. Before documenting it, the open question had to be
settled: should Kernel adopt a classic fixed column grid (the 12-column
system most design systems ship), or bless the fluid approach the
components already use?

## Decision

**Kernel's layout is fluid by doctrine — there is no fixed column grid,
and the Layout foundation page documents that as intentional.**

- **Breakpoints are Tailwind's defaults** (sm 640 / md 768 / lg 1024 /
  xl 1280 / 2xl 1536). No custom breakpoints, no `--breakpoint-*` tokens —
  nothing to keep in sync.
- **Column count derives from available space, not a grid.** Grids that can
  sit beside the sidebar use `repeat(auto-fit, minmax(Npx, 1fr))`; the rail
  docking or collapsing reflows content instead of overflowing it. A fixed
  12-column grid would fight the collapsible-sidebar architecture — the
  usable width is not a constant.
- **The existing grid rules are the doctrine** (previously convention-only
  in CLAUDE.md, now user-facing on the Layout page): declare the mobile
  column explicitly; raw `1fr` in arbitrary tracks is `minmax(0,1fr)`;
  atomic-width rows scroll in place (`overflow-x-auto`); auto-fit beside
  the sidebar.
- **Prose has a measure even though pages don't**: leads and explanatory
  paragraphs cap at `max-w-2xl` (~65–75ch); data surfaces take full width.

## Rejected alternative

A 12-column grid with gutter/margin tokens. None of the shipped components
or patterns are built on one; introducing it would add a second layout
model that exists only in documentation. If a future surface genuinely
needs column coordination across unrelated components, that's a new
decision.

## Consequences

- The Layout foundation page (`/layout`) is the reference: breakpoint
  ladder with a live viewport indicator, the four grid rules, an auto-fit
  demo, and the content measure.
- The mobile audit (390px scan) remains the enforcement mechanism for the
  grid rules; the page and the audit describe the same contract.
- "Add a breakpoint" or "add a grid system" is a supersession of this
  record, not a drive-by change.
