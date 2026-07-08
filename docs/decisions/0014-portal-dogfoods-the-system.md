# 0014 — The portal is an application of the system (dogfooding)

Date: 2026-07-05 · Status: accepted

## Context

The repo holds two things that were being conflated:

1. **The design system** — the reusable layer (`src/components/ui/*`, the
   tokens). Consumed by any product.
2. **The portal** — an *application*: its own documentation chrome (the
   sidebar, header, `Section`/`Subhead`/`GroupHeader`/`Demo`, the
   foundation pages) **and** the example screens (dashboard, tables,
   origination, settlement…).

The portal *documented* a type system it didn't *use*. `section.tsx`
hand-rolled headings (`text-3xl … tracking-tight`, a `font-mono`
`tracking-[0.14em]` eyebrow, ad-hoc `tracking-[0.06em]` subheads) that
didn't match the named styles the Typography page teaches (Page title is
`tracking-[-0.02em]`; Overline is `text-2xs … tracking-[0.13em]`). The
Typography specimen even labelled Display "text-5xl" while rendering it at
`text-4xl`. The docs and the app had drifted.

## Decision

**The portal must be a first-class application of the system it documents.
The reusable components stay the layer underneath; everything else consumes
them — including the type roles.**

- The system's named type roles live in **one source**,
  `src/lib/type-styles.ts` (`typeStyles`: display · pageTitle ·
  sectionTitle · cardTitle · body · bodySmall · label · caption · overline
  · numeric · code).
- Both the **Typography foundation** (the specimen) and the **portal
  chrome** (`Section`, `Subhead`, `GroupHeader`) import `typeStyles`, so
  what the system documents and what the app renders are the *same
  strings*. Drift is now a compile-time impossibility.
- The static preview's chrome CSS (`.eyebrow`, `.section-title`,
  `.subhead` in `portal.css`) mirrors the same role values, so both
  surfaces render the system they document.
- Example screens are held to the same bar: they apply the system
  rigorously (tokens, type roles, status/commodity color, real
  components), reviewed through the `kernel-typesetting` / `kernel-visual`
  / `kernel-norman` lenses. (This decision opens that work; the commodity
  color-coding pass and this type pass are the first slices.)

## Consequences

- "Change a type role" is a one-line edit in `type-styles.ts` that updates
  the docs and the whole app together.
- New portal chrome and example screens reference `typeStyles` (and the
  spacing scale, and real components) rather than inventing values —
  reviewers reject ad-hoc `tracking-[…]` / one-off sizes on sight.
- Visible shifts this introduced, all toward the documented system: the
  eyebrow is now a sans Overline (was mono), the Display specimen renders
  at its true `text-5xl`, subheads use the Overline role.
- The preview's `.subhead` rhythm moved onto the 4pt grid (38→36px).
