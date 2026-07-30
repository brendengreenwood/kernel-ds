/**
 * Object model — shared types.
 *
 * The stub object model is the substrate the object-centric IA
 * (decision 0026) demonstrates against. It is UI-agnostic: nothing in
 * `src/lib/objects/` imports from `src/components/`. Later segments
 * import the models and rows into pages.
 */

export type ObjectId = string

export type StatusTone =
  | "draft"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "neutral"

export interface ObjectStatus {
  key: string
  label: string
  tone: StatusTone
}

export type FieldType = "text" | "number" | "money" | "date" | "status" | "ref"

export interface ObjectField<T = unknown> {
  key: string
  label: string
  type: FieldType
  /** A representative sample value used by demos and generative previews. */
  sample: T
}

export interface ObjectAssociation {
  key: string
  label: string
  /** `objectRegistry` key of the target object (e.g. "settlement"). */
  targetObjectKey: string
}

export interface ObjectModel {
  key: string
  label: string
  plural: string
  fields: ObjectField[]
  statuses: ObjectStatus[]
  associations: ObjectAssociation[]
}

/**
 * A concrete row of an object. Values are keyed by `ObjectField.key`.
 *
 * `coord` is a mock 2D coordinate in `[0..100]` on each axis, used by
 * the substrate demo (segment 02) and any Collection/Traversal
 * spatial view. This is a mock: a real spatial engine will replace
 * it, and `coord` should become optional once objects without spatial
 * rendering exist (recorded in decision 0027 consequences).
 */
export interface ObjectRow {
  id: ObjectId
  coord: { x: number; y: number }
  [key: string]: unknown
}
