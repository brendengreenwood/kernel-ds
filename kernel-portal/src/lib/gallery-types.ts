import * as React from "react"

/**
 * One component page under /components/:slug — a demo cluster carved out
 * of the old single-page gallery (decision 0011). Clusters keep the
 * gallery's grouping (Actions, Data display, …) so related components
 * that demo together stay together.
 */
export type GalleryCluster = {
  /** legacy in-page anchor, e.g. "c-button" (kept for hash redirects) */
  anchor: string
  /** route slug under /components/, e.g. "button" */
  slug: string
  /** page title, e.g. "Toggle · Toggle group" */
  title: string
  /** gallery group the cluster belongs to, e.g. "Actions" */
  group: string
  demo: React.ComponentType
}
