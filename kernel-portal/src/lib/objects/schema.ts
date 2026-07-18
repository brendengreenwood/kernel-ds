/**
 * Object model schema — objects arrive as validated JSON.
 *
 * `parseObjectModel(json)` is the single entry point for JSON-defined
 * objects: it validates a `{ model, rows }` envelope against zod
 * schemas mirroring `types.ts`, then derives deterministic fallback
 * coords for rows that carry none (ObjectRow.coord is still required
 * at the type level — decision 0027; optionality is tracked on the
 * tech-debt board item).
 *
 * `tone` is REQUIRED on every status entry — this is what makes the
 * generic status path (status-map.ts `statusFromModel`) safe for
 * foreign objects: a registered model always declares how each status
 * renders.
 *
 * UI-agnostic: imports zod and local types only, never components.
 * Zod errors are thrown untouched; caller-facing messaging is the
 * studio `defineObject` tool's problem (next plan).
 */

import { z } from "zod"

import type { ObjectModel, ObjectRow } from "./types"

const fieldTypeSchema = z.enum([
  "text",
  "number",
  "money",
  "date",
  "status",
  "ref",
])

const statusToneSchema = z.enum([
  "draft",
  "active",
  "success",
  "warning",
  "danger",
  "neutral",
])

export const objectModelSchema = z.object({
  /** Lowercase slug — becomes the registry key. */
  key: z.string().regex(/^[a-z][a-z0-9-]*$/, "key must be a lowercase slug"),
  label: z.string().min(1),
  plural: z.string().min(1),
  fields: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      type: fieldTypeSchema,
      sample: z.unknown(),
    }),
  ),
  statuses: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      // Required: the generic status path reads this tone.
      tone: statusToneSchema,
    }),
  ),
  // Targets may reference not-yet-registered objects; previews null-guard.
  associations: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      targetObjectKey: z.string().min(1),
    }),
  ),
})

const coordSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

/** Rows require `id`, allow arbitrary field values; `coord` optional here. */
export const objectRowsSchema = z.array(
  z.looseObject({
    id: z.string().min(1),
    coord: coordSchema.optional(),
  }),
)

const envelopeSchema = z.object({
  model: objectModelSchema,
  rows: objectRowsSchema,
})

/** djb2 (xor variant), unsigned. Deterministic across sessions. */
function djb2(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(hash, 33) ^ input.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Deterministic fallback coord for rows without one, landing in
 * `[5..95]` on both axes — the same envelope dataset.ts uses.
 */
function deriveCoord(id: string): { x: number; y: number } {
  return {
    x: 5 + (djb2(`x:${id}`) % 91),
    y: 5 + (djb2(`y:${id}`) % 91),
  }
}

/**
 * Parse a JSON string of shape `{ model, rows }` into a typed
 * ObjectModel + ObjectRow[], deriving missing coords. Throws zod's
 * error (or JSON.parse's SyntaxError) on invalid input.
 */
export function parseObjectModel(json: string): {
  model: ObjectModel
  rows: ObjectRow[]
} {
  const parsed = envelopeSchema.parse(JSON.parse(json))

  const model: ObjectModel = {
    key: parsed.model.key,
    label: parsed.model.label,
    plural: parsed.model.plural,
    fields: parsed.model.fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      sample: f.sample,
    })),
    statuses: parsed.model.statuses,
    associations: parsed.model.associations,
  }

  const rows: ObjectRow[] = parsed.rows.map((r) => ({
    ...r,
    coord: r.coord ?? deriveCoord(r.id),
  }))

  return { model, rows }
}
