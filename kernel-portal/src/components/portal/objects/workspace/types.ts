import type * as React from "react"
import type { ObjectModel, ObjectRow } from "@/lib/objects"

/**
 * Workspace framework — shared contracts (decision 0029).
 *
 * The composability doctrine in one file:
 *
 *   1. Views are functions of context — `render(ctx)`; no view knows
 *      where it is mounted.
 *   2. Panels are anonymous slots — a `Panel` hosts an ordered list of
 *      views; "inspector"/"canvas" are roles the page layout assigns.
 *   3. The inspector is a panel, not a component.
 *   4. Multiplicity is allowed — the dock holds an array of panels.
 *   5. The navigator is owned by the active rail mode.
 */

/** Everything a view may know: the bound object, its rows, the live selection. */
export interface WorkspaceContext {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
  selectedId: string | null
  select: (id: string) => void
}

/** A mountable view — pure function of context, host-agnostic. */
export interface WorkspaceView {
  key: string
  label: string
  render: (ctx: WorkspaceContext) => React.ReactNode
}

/**
 * Activity-rail mode key. Modes arrive as preset data (decision 0032),
 * so the set of keys is open — a preset declares its own modes.
 */
export type WorkspaceMode = string
