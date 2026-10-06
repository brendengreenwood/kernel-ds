# 0084 — Experimental components may defer their Figma family

Date: 2026-10-04
Status: accepted
Extends: 0078

## Context

The Figma integration program (0078) pins its scope to every `@kernel/ui` component: each one needs a generated contract, cohort files, a runtime-proof scenario and live Figma evidence. Adding `component.panes` (0083) raised the count to 63. Building its Figma family needs the Desktop Bridge and is a design task of its own, so a new experimental primitive could not ship until Figma caught up.

## Decision

`scripts/ds/figma/component-scope.mjs` holds a named `FIGMA_DEFERRED_COMPONENTS` set. Components on it stay in the catalog, docs and portal but are left out of the Figma scope, so the pinned count stays honest. Only experimental components belong on the list, each one for a stated reason. `component.panes` is the first entry.

## Consequences

- When a deferred component's Figma family is built, remove it from the set; the scope count, cohorts and runtime matrix then rise with it in the same change.
- The list is visible in one place, so deferral can't happen silently.
