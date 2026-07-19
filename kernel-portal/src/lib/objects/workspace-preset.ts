/**
 * Workspace preset schema — workspaces arrive as validated JSON.
 *
 * `parseWorkspacePreset(json)` is the single entry point for
 * JSON-defined workspaces: a preset declares rail modes, each binding
 * an object key, a navigator idiom, canvas view keys, and default dock
 * panels. One preset = one whole workspace — loading a preset replaces
 * the mode set.
 *
 * Per-idiom coherence lives in the schema, not the renderer: a
 * `grouped` mode must declare `groupByOptions`, a `queries` mode must
 * declare `savedQueries`, and `defaultGroupBy` must be a member of
 * `groupByOptions`. Alien presets are the point — incoherent modes are
 * caught at parse time.
 *
 * Deliberately NOT validated here: that `objectKey` is registered, or
 * that `canvasViews` / `dockPanels[].views` keys exist in the
 * component-layer `workspaceViews` registry. The object registry is
 * runtime-mutable and lib/objects never imports components
 * (lib-never-imports-components) — resolution and null-guarding are
 * the host component's job.
 *
 * UI-agnostic: imports zod and local types only, never react or
 * components. Zod errors are thrown untouched; caller-facing messaging
 * is the future studio tool's problem.
 */

import { z } from "zod"

export type WorkspaceNavigatorIdiom = "grouped" | "queries" | "associations"

export interface WorkspacePresetMode {
  key: string
  label: string
  icon: string
  objectKey: string
  navigator: {
    idiom: WorkspaceNavigatorIdiom
    groupByOptions?: string[]
    defaultGroupBy?: string
    savedQueries?: string[]
  }
  canvasViews: string[]
  dockPanels: { title: string; views: string[] }[]
}

export interface WorkspacePreset {
  key: string
  label: string
  modes: WorkspacePresetMode[]
}

const slug = z.string().regex(/^[a-z][a-z0-9-]*$/, "must be a lowercase slug")

const navigatorIdiomSchema = z.enum(["grouped", "queries", "associations"])

const presetModeSchema = z
  .object({
    key: slug,
    label: z.string().min(1),
    /** Icon KEY into the UI layer's rail icon registry — unknown keys fall back to a glyph. */
    icon: z.string().min(1),
    /** Object key the mode binds; resolving key → model/rows is host policy. */
    objectKey: slug,
    navigator: z.object({
      idiom: navigatorIdiomSchema,
      groupByOptions: z.array(z.string().min(1)).optional(),
      defaultGroupBy: z.string().min(1).optional(),
      savedQueries: z.array(z.string().min(1)).optional(),
    }),
    /** View keys into the component-layer workspaceViews registry. */
    canvasViews: z.array(z.string().min(1)).min(1),
    /** May be empty — a zero-panel dock is doctrine-legal. */
    dockPanels: z.array(
      z.object({
        title: z.string().min(1),
        views: z.array(z.string().min(1)),
      }),
    ),
  })
  .superRefine((mode, ctx) => {
    const nav = mode.navigator
    if (nav.idiom === "grouped" && !(nav.groupByOptions && nav.groupByOptions.length > 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["navigator", "groupByOptions"],
        message: "grouped idiom requires non-empty groupByOptions",
      })
    }
    if (nav.idiom === "queries" && !(nav.savedQueries && nav.savedQueries.length > 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["navigator", "savedQueries"],
        message: "queries idiom requires non-empty savedQueries",
      })
    }
    if (
      nav.defaultGroupBy !== undefined &&
      !(nav.groupByOptions ?? []).includes(nav.defaultGroupBy)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["navigator", "defaultGroupBy"],
        message: "defaultGroupBy must be a member of groupByOptions",
      })
    }
  })

export const workspacePresetSchema = z
  .object({
    key: slug,
    label: z.string().min(1),
    modes: z.array(presetModeSchema).min(1),
  })
  .superRefine((preset, ctx) => {
    const seen = new Set<string>()
    for (const [i, mode] of preset.modes.entries()) {
      if (seen.has(mode.key)) {
        ctx.addIssue({
          code: "custom",
          path: ["modes", i, "key"],
          message: `duplicate mode key "${mode.key}"`,
        })
      }
      seen.add(mode.key)
    }
  })

/**
 * Parse a JSON string into a typed WorkspacePreset. Throws zod's error
 * (or JSON.parse's SyntaxError) on invalid input.
 */
export function parseWorkspacePreset(json: string): WorkspacePreset {
  return workspacePresetSchema.parse(JSON.parse(json))
}
