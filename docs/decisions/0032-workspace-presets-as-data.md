# 0032 — Workspace presets as data

**Date:** 2026-07-19
**Status:** Accepted
**Relates to:** 0029 (workspace anatomy + composability doctrine), 0030 (composition contract), 0031 (status labels from model)

## Decision

A workspace configuration is a **preset**: a JSON document validated by
`workspacePresetSchema` and parsed by `parseWorkspacePreset`
(`kernel-portal/src/lib/objects/workspace-preset.ts`). The Mock Workspace at
`/workspace-obj` derives its entire anatomy — activity rail modes, navigator
idiom, canvas views, and default dock panels — from a preset. No surface
hardcodes a mode list.

This is the same move the dynamic-objects plan (decision 0030 arc, PR #58)
made for objects, one level up: schema → parse → default-as-data → alien
proof.

## What a preset is

```
WorkspacePreset {
  key: slug
  label: string
  modes: WorkspacePresetMode[]   // non-empty, keys unique
}

WorkspacePresetMode {
  key: slug                      // rail mode identity
  label: string                  // rail button accessible name
  icon: string                   // icon KEY, not a component (see below)
  objectKey: slug                // which object binds — resolution is the host's job
  navigator: {
    idiom: "grouped" | "queries" | "associations"
    groupByOptions?: string[]    // required non-empty for grouped
    defaultGroupBy?: string      // must be a member of groupByOptions
    savedQueries?: string[]      // required non-empty for queries
  }
  canvasViews: string[]          // non-empty view keys into workspaceViews
  dockPanels: { title, views: string[] }[]  // may be empty — zero-panel dock is legal
}
```

Per-idiom coherence is enforced by the schema, not the renderer: a `grouped`
mode without `groupByOptions`, a `queries` mode without `savedQueries`, or a
`defaultGroupBy` outside `groupByOptions` fails at parse time. Alien presets
are the point — the schema catches incoherent modes before they render.

Deliberately **not** validated at parse time: that `objectKey` is registered,
or that `canvasViews`/`dockPanels.views` keys exist in `workspaceViews`. The
registry is runtime-mutable and `lib/objects` never imports the
component-layer view registry (`lib-never-imports-components`). The host
component null-guards: an unregistered `objectKey` renders an empty-state
panel; unknown view keys are skipped with a visible caption.

## One preset = one workspace

Loading a preset replaces the whole mode set: the rail rebuilds, selection
and dock reset, and the first mode of the new preset becomes active. Presets
are session state only — page reload restores the default preset, the same
lifecycle as runtime object registration (Incident). Persistence is a future
concern, deliberately out of scope here.

The default four-mode workspace (Contracts / Settlements / Query / Traversal)
is itself authored as a JSON string and parsed through `parseWorkspacePreset`
at module scope — the schema's first real consumer. Pixel-parity against the
pre-existing `drive-workspace.mjs` (9/9, script hash-verified unmodified)
proves the schema can express a real workspace, not just a toy.

## Host resolves data — presets bind keys

A preset declares `objectKey` and view keys; **resolving keys to models,
rows, and views is the host's job**. Presets stay portable; data topology
stays host policy.

The demo host (`/workspace-obj`) resolves rows by idiom:

- `associations` idiom → registry rows (stubs — association joins resolve
  through the registry)
- otherwise → `demoDataset[objectKey]` when present, else registry rows
  (which is how the Incident preset binds its registered rows with zero
  special-casing)

This idiom-keyed resolution is **demo-host policy, not preset semantics**. A
preset author changing a mode's idiom must not be surprised that the demo
host swaps its data source — a real host would bind data however it likes
(API, store, live query). The known "60 demo rows vs registry stub rows"
seam stays where it is, documented, not worsened.

**Rejected alternative:** a `rowsSource` field in the preset JSON. That
leaks host data topology into a document that is supposed to be portable —
the same preset should work against any host that can resolve its keys.

## Icons are keys, not components

Icons can't ride in JSON. A preset mode declares an `icon` *key*;
`activity-rail.tsx` owns a small `railIconRegistry`
(`table`→Table2, `file`→FileText, `search`→Search, `route`→Route). Unknown
keys render the mode label's first letter as a mono glyph carrying
`data-slot="rail-icon-fallback"` — a fallback, not an error, because foreign
presets must not crash the rail. The icon vocabulary lives in the UI layer
by design — the same reasoning as `lib-never-imports-components`.

## Relation to prior decisions

- **0029** gave the workspace its anatomy (rail → navigator → canvas → dock)
  and the composability doctrine (views are functions of context, panels are
  anonymous slots). Presets parameterize that anatomy without changing it.
- **0030** made composition machine-readable and established the arc:
  objects arrive as validated JSON via `parseObjectModel`. Presets are the
  sibling document one level up.
- **0031** made badge text model-driven, so a preset-driven workspace
  renders correct status labels for any domain for free.

## Generative-UI arc position

Objects as data ✅ (0030 arc) → **workspaces as data ✅ (this decision)** →
agent tool next. An agent can now generate a working *tool* — an object plus
a workspace — as two JSON documents, proven by the Incident ops preset: a
workspace for an object with zero object-specific TSX, loaded from JSON at
runtime and exercised end to end by `drive-preset-workspace.mjs`.
