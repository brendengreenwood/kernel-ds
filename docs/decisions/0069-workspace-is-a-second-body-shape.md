# 0069 — A workspace route is a second body shape for the app shell

- **Date:** 2026-08-07
- **Status:** accepted
- **Extends:** 0066

## Context

The app shell has one body shape: a page plate on the canvas with a document
flowing inside it. Decision 0066 gave that plate its treatment — uniform gutter,
edge and lip hairlines, `--shadow-2xl`, scoped above 48rem.

Editing a bid is not a document. The subject is one object, it is spatial, it
fills the viewport, and the chrome around it is not navigation between pages but
selection and action on the thing already on screen. Flowing it into the page
plate would have meant scrolling a map, which is the wrong verb.

## Decision

The app shell admits a second body shape — the **workspace** — distinguished from
the page by an elevation ladder rather than by new colour, new borders or new
tokens:

1. **Choosing chrome sits under the work.** The rail and the workspace navigator
   stay at canvas level, unplated. They select the subject.
2. **The work is the only raised surface.** It takes the same plate treatment the
   page takes: `--panel-radius`, edge and lip hairlines, the promoted shadow.
3. **Acting chrome sits over the work.** The dock floats on the plate, inset from
   its corners, carrying a brand-tinted edge rather than the neutral one.

The navigator is a sibling of the inset, not a child — a child would be on the
plate, and the plate is the subject. The rail component itself does not change:
the application's identity is not a function of its body.

## Consequences

- A workspace route sets its own frame (`h-svh`, no page scroll); the only
  scrolling regions are the navigator's list and the dock's body.
- No new tokens. If the ladder proves out across more than one workspace, the
  rule — not the map — is what the DS `app-shell` entity should absorb.
- Domain rendering inside the plate (here, MapLibre) is prototype-local and is
  themed from DS tokens rather than shipping its own palette. Third-party chrome
  is re-dressed to `--card`/`--border`/`--accent`.
- Decision 0058's replacement, 0068, still governs: this is a prototype surface,
  so the workspace is maintained and buildable in CI, but it is not a shipped
  product surface.
