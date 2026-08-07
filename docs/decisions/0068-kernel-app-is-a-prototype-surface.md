# 0068 — `kernel-app/` is a prototype surface on main

Date: 2026-08-07
Status: accepted
Amends: 0058 (`kernel-app/` is the v2 prototype, not a product surface), 0022 (single-surface rule)

## Context

Decision 0058 framed `kernel-app/` as a branch-only design sandbox: something
that could be "abandoned without losing the parts worth keeping", because the
drift register captured everything promotable. That framing did its job — the
register drove the v2 promotion (decisions 0064–0066), the promoted entries
were flipped and the app's layers deduplicated against the DS, and the branch
merged main back in.

But the prototype survived its own promotion. It is still the only realistic
consumer exercising the DS at product density — the panel furniture, the
cell-as-control tables, the rail, the charts — and every open question the
register still holds (the charting layer, the light accent pass) needs the
prototype alive to answer it. Work on it continues; keeping that work on a
long-lived side branch means every session starts with a sync merge and every
DS finding crosses a branch boundary to land.

## Decision

**`kernel-app/` is promoted from a branch-only sandbox to a maintained
prototype surface: it lives on `main`, is built by CI, and keeps evolving
there. It is still a prototype — not a product surface.**

Consequences:

- **The prototype branch merges into main** (PR #72) and future prototype work
  happens on normal feature branches against main, like everything else.
- **What stands from 0058:** the prototype is not authoritative — its screens,
  copy, and data do not define product behaviour and must not be cited as a
  spec. Fixes flow upstream into the DS; prototype styling stays in its own
  two layers (`index.css` token overrides + `v2-layer.css`) and never leaks
  into `packages/ui`.
- **What changes from 0058:** "abandonable" is no longer the design goal. The
  app is maintained: it builds in CI (`kernel-app` job — root install for the
  DS's workspace deps, then app install, `tsc && vite build`), and a broken
  prototype build blocks merges the same as a broken portal build.
- **Decision 0022 is amended, not repealed.** The portal remains the design
  system's only *documentation* surface. `kernel-app/` is a different
  category — a prototype surface: a consumer that exists to generate design
  pressure, not to document or to ship.
- **The register keeps running on main.** `docs/v2-prototype-drift.md` and
  `scripts/check-drift-register.mjs` arrive with the merge; the
  promotion-queue model of decision 0056 continues — drift is documented as it
  happens, promoted deliberately, and flipped when it lands.
- **Naming stands.** Directory `kernel-app/`, package `kernel-v2-prototype`,
  markers `data-v2-*` — the "v2" vocabulary is correct *inside* the prototype
  layers; the rule that no `--v2-*` name lands in the DS is unchanged.

## Deliberately deferred

- **Deploy previews.** The branch-scoped Netlify context that built the app
  dies with the branch's retirement as the working home. Whether the app gets
  its own deploy context on main is a follow-up, not a blocker — CI proves the
  build; a live preview is a convenience.
- **Workspace membership.** The app keeps its independent install (own
  lockfile, root install for DS deps, consume-at-source per decision 0034).
  Folding it into the root npm workspace is a separate call with its own
  dependency-resolution consequences.

## Verification

Post-merge on main: `kernel-app` `tsc && vite build` clean; the full gate
suite green (`ui:test`/`ui:check`/`catalog:check`/`ds:doctor` including the
decision-number and drift-register checks); portal build + gates unaffected.
