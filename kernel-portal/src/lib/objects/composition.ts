/**
 * Composition contract — the machine-readable manifest of how the object
 * system composes (decision 0030).
 *
 * This file is DATA ONLY: no component imports, no react, no side effects.
 * It is the source of truth for the rules agents reach for instead of
 * re-deriving conventions from prose. `scripts/emit-composition.mjs`
 * serializes it to `public/composition.json` (served by the portal, so an
 * agent can fetch it); the prose decision records in `docs/decisions/`
 * remain the *why*.
 */

/** A generic object primitive an agent can reach for. */
export interface CompositionPrimitive {
  key: string
  label: string
  /** The prop contract every generic primitive obeys. */
  propsContract: string
  /** One-sentence rule for when an agent reaches for this primitive. */
  when: string
  /**
   * Canonical `data-slot` name for the primitive. Workspace regions emit
   * their slots today; the preview primitives declare theirs here as the
   * canonical vocabulary — `emitted: false` means the DOM attribute is not
   * yet rendered (follow-up on the board), so do not write locators
   * against it yet.
   */
  dataSlot: string
  emitted: boolean
}

/** A workspace region (decision 0029 anatomy). */
export interface CompositionRegion {
  key: string
  dataSlot: string
  /** What the region owns. */
  owns: string
  /** Resizable via the DS Resizable component (rail is fixed). */
  resizable: boolean
  rule: string
}

/** A doctrine rule with its authoritative source record. */
export interface CompositionRule {
  id: string
  statement: string
  source: `decision-${string}` | "amendment-A4"
}

export const primitives: readonly CompositionPrimitive[] = [
  {
    key: "shell",
    label: "Shell",
    propsContract: "page-level frame (no generic props yet)",
    when: "Reach for Shell when a surface needs the object-centric page frame before any primitive renders inside it.",
    dataSlot: "object-shell",
    emitted: false,
  },
  {
    key: "collection",
    label: "Collection",
    propsContract: "({ model, rows }) => JSX",
    when: "Reach for Collection when the user needs to scan many rows of one object — it renders the model's fields as columns with model-toned status badges.",
    dataSlot: "object-collection",
    emitted: false,
  },
  {
    key: "record",
    label: "Record",
    propsContract: "({ model, row }) => JSX",
    when: "Reach for Record when one row is in focus — it renders every field of a single row plus its association targets.",
    dataSlot: "object-record",
    emitted: false,
  },
  {
    key: "write",
    label: "Write",
    propsContract: "({ model, rows }) => JSX",
    when: "Reach for Write when the user changes data — it derives a form and in-place editors from the model's field types.",
    dataSlot: "object-write",
    emitted: false,
  },
  {
    key: "query",
    label: "Query",
    propsContract: "({ model, rows }) => JSX",
    when: "Reach for Query when the user filters or searches across an object's rows — it derives filter controls from the model's fields and statuses.",
    dataSlot: "object-query",
    emitted: false,
  },
  {
    key: "traversal",
    label: "Traversal",
    propsContract: "({ model, rows }) => JSX",
    when: "Reach for Traversal when the user walks associations between objects — it follows the model's association declarations, null-guarding unregistered targets.",
    dataSlot: "object-traversal",
    emitted: false,
  },
] as const

export const regions: readonly CompositionRegion[] = [
  {
    key: "activityRail",
    dataSlot: "workspace-activity-rail",
    owns: "mode switching — one icon button per workspace mode, aria-pressed marks the active mode",
    resizable: false,
    rule: "The rail is fixed-width and never hosts panels; it only changes which mode owns the navigator and canvas.",
  },
  {
    key: "navigator",
    dataSlot: "workspace-navigator",
    owns: "mode-owned navigation — grouped trees with counts for object modes, canned queries for query mode, association walking for traversal mode",
    resizable: true,
    rule: "The navigator is a resizable region (DS Resizable panel); its contents are a function of the active mode, never hardcoded per object.",
  },
  {
    key: "canvas",
    dataSlot: "workspace-panel",
    owns: "the primary view panel — an anonymous workspace-panel hosting the mode's views (tab strip when more than one)",
    resizable: true,
    rule: "The canvas has no dedicated data-slot; it hosts an anonymous workspace-panel (panels-are-anonymous-slots), located as the panel outside workspace-dock. It is a resizable region.",
  },
  {
    key: "dock",
    dataSlot: "workspace-dock",
    owns: "zero or more panels — the default inspector is just a panel; users can pin additional frozen panels",
    resizable: true,
    rule: "The dock is a resizable region holding an array of anonymous panels; multiplicity is allowed and every panel is closable.",
  },
] as const

/**
 * The workspace preset contract (decision 0032) — how a whole workspace
 * arrives as data. The zod schema in lib/objects/workspace-preset.ts is the
 * enforcement; this section is the agent-facing description of its shape.
 */
export interface CompositionPresets {
  /** Module that owns the schema and parser. */
  schemaModule: string
  /** The parse entry point and its envelope. */
  parse: string
  /** Every field a preset mode declares, with its constraint. */
  modeFields: readonly string[]
  /** The navigator idiom enum. */
  idioms: readonly string[]
  /** Icon keys the rail resolves to components — UI-layer vocabulary. */
  iconKeys: readonly string[]
  /**
   * Unknown icon keys render the mode label's first letter in a glyph
   * carrying this data-slot (emitted in the DOM when a foreign icon key
   * is present — a fallback, not an error).
   */
  iconFallbackDataSlot: string
  /** The demo host's row-resolution policy — host policy, not preset semantics. */
  hostResolvesRows: string
}

export const presets: CompositionPresets = {
  schemaModule: "lib/objects/workspace-preset.ts",
  parse:
    "parseWorkspacePreset(json) => WorkspacePreset ({ key, label, modes[] }); zod-validated, mode keys unique, per-idiom coherence enforced at parse time",
  modeFields: [
    "key (slug, unique within the preset)",
    "label (rail button accessible name)",
    "icon (icon key, resolved by the UI layer — see iconKeys)",
    "objectKey (slug — which object binds; resolving it to a model and rows is the host's job)",
    "navigator.idiom (grouped | queries | associations)",
    "navigator.groupByOptions (required non-empty when idiom is grouped)",
    "navigator.defaultGroupBy (optional; must be a member of groupByOptions)",
    "navigator.savedQueries (required non-empty when idiom is queries)",
    "canvasViews (non-empty view keys resolved through workspaceViews; unknown keys are skipped with a visible caption)",
    "dockPanels ({ title, views }[] — may be empty; a zero-panel dock is legal)",
  ],
  idioms: ["grouped", "queries", "associations"],
  iconKeys: ["table", "file", "search", "route"],
  iconFallbackDataSlot: "rail-icon-fallback",
  hostResolvesRows:
    "Demo-host policy (not preset semantics): associations idiom binds registry rows so joins resolve through the registry; otherwise demoDataset[objectKey] when present, else registry rows. The model always comes from getObjectModel(objectKey), null-guarded with an empty-state panel when unregistered.",
} as const

/**
 * The definition-files contract (decision 0033) — how agent-authored tools
 * persist. A persisted tool is two JSON documents (an object model and a
 * workspace preset) under public/definitions/, listed in manifest.json and
 * registered at boot by lib/objects/definitions-loader.ts. Session
 * registration (registerObject at runtime) remains for demos.
 */
export interface CompositionDefinitions {
  /** The manifest the boot loader fetches. */
  manifest: string
  /** Directory layout under public/definitions/. */
  layout: readonly string[]
  /** Boot-loader policy, including the SPA-redirect tolerance. */
  loaderPolicy: string
  /** Per-document failure isolation. */
  failureIsolation: string
  /** The only write path for agent-authored definitions. */
  writePath: string
}

export const definitions: CompositionDefinitions = {
  manifest:
    'public/definitions/manifest.json — { "version": 1, "definitions": [{ "kind": "object" | "workspace", "path": "objects/<key>.json" | "workspaces/<key>.json" }] }; ships empty (zero definitions) so the default rendered state carries no persisted tools',
  layout: [
    "objects/<key>.json — an object model document, parsed by parseObjectModel",
    "workspaces/<key>.json — a workspace preset document, parsed by parseWorkspacePreset",
  ],
  loaderPolicy:
    "loadDefinitions() runs once at portal boot (fire-and-forget from main.tsx); registry subscriptions propagate arrivals. Manifest tolerance is specified behavior: the deployed SPA redirect (/* -> /index.html, status 200) returns HTML-with-200 for a missing manifest, so any of non-OK response, non-JSON content type, or JSON parse failure means zero definitions and returns silently.",
  failureIsolation:
    "Per-document errors are caught and collected ({ loaded, failed }); one bad document never takes down boot or the other documents. A preset whose objectKey never registered still lists and loads — the canvas shows the existing not-registered null-guard state.",
  writePath:
    "kernel-studio-server/src/lib/definitions.ts writeDefinition: re-validates through the portal's validate-definition CLI subprocess, throws on an invalid verdict without writing, path-guards the target, and rewrites the manifest last (atomic publish).",
} as const

export const rules: readonly CompositionRule[] = [
  {
    id: "views-are-functions-of-context",
    statement:
      "A workspace view is a pure function of WorkspaceContext ({ model, rows, selectedId, select }); views never own object-specific state.",
    source: "decision-0029",
  },
  {
    id: "panels-are-anonymous-slots",
    statement:
      "A panel is an anonymous slot that hosts any array of views with a tab strip when more than one; nothing about a panel is object-specific.",
    source: "decision-0029",
  },
  {
    id: "inspector-is-a-panel",
    statement:
      "The inspector is not a special region — it is just a panel in the dock, replaceable and composable like any other.",
    source: "decision-0029",
  },
  {
    id: "multiplicity-allowed",
    statement:
      "The dock holds an array of panels; pinning clones the current context into a frozen panel while the live inspector keeps following selection.",
    source: "decision-0029",
  },
  {
    id: "regions-resizable",
    statement:
      "Navigator, canvas, and dock are resizable regions hosted in the DS Resizable component; the activity rail is fixed.",
    source: "decision-0029",
  },
  {
    id: "status-via-model-tones",
    statement:
      "Status colors derive from model-declared tones via the single toneToStatus map (active maps to booked, never pending); badge text derives from model-declared status labels — no surface hardcodes per-object status switches or vocabulary.",
    source: "amendment-A4",
  },
  {
    id: "single-tone-map-source",
    statement:
      "Exactly one tone-to-Status map exists, in lib/objects/status-map.ts; check-status-map.mjs fails when run (kernel-verify / ship gate) if another file defines one.",
    source: "decision-0030",
  },
  {
    id: "lib-never-imports-components",
    statement:
      "Files under lib/objects/ never import from components/; React may appear only in dedicated hook files (use-*.ts), keeping the object model UI-agnostic.",
    source: "decision-0030",
  },
  {
    id: "registration-only-via-registerObject",
    statement:
      "All object registration flows through registerObject(model, rows); no component mutates objectRegistry or objectRowsRegistry directly.",
    source: "decision-0030",
  },
  {
    id: "workspaces-arrive-as-data",
    statement:
      "A workspace preset is a validated JSON document parsed by parseWorkspacePreset; rail modes, navigator idiom, canvas views, and default dock panels derive from preset data — no object-workspace surface hardcodes a mode list.",
    source: "decision-0032",
  },
  {
    id: "preset-binds-keys-host-binds-data",
    statement:
      "A preset declares objectKey and view keys; resolving keys to models, rows, and views is the host's job — presets stay portable, data topology stays host policy.",
    source: "decision-0032",
  },
  {
    id: "definitions-are-files",
    statement:
      "Persisted tools are JSON documents in public/definitions/ (an object model plus a workspace preset), listed in manifest.json and registered at boot by the definitions loader; session registration via registerObject remains available for demos.",
    source: "decision-0033",
  },
  {
    id: "agents-write-through-validation",
    statement:
      "The only write path for agent-authored definitions is validate-then-write against the portal's own schemas (writeDefinition spawns the validate-definition CLI and throws on an invalid verdict without writing) — enforced by the vitest case 'rejects an invalid document (missing tone): validateDefinition says no, writeDefinition throws without writing', not merely stated.",
    source: "decision-0033",
  },
] as const

/** The whole contract as one object — what emit-composition.mjs serializes. */
export const compositionContract = {
  version: 1,
  primitives,
  regions,
  rules,
  presets,
  definitions,
} as const
