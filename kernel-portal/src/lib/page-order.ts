import { galleryClusters } from "./gallery-registry"

/**
 * The portal's linear reading order — the sequence the bottom pager walks
 * (a mobile documentation-portal pattern). Mirrors the side-rail order so
 * "next" always means "the next thing in the rail". Component pages slot in
 * right after the Components index, matching the "Component pages" group.
 */
export type DocPage = { path: string; title: string }

export const docOrder: DocPage[] = [
  { path: "/", title: "Overview" },
  { path: "/install", title: "Install & usage" },
  { path: "/status", title: "Component status" },
  { path: "/colors", title: "Color" },
  { path: "/typography", title: "Typography" },
  { path: "/spacing", title: "Spacing & radius" },
  { path: "/layout", title: "Layout" },
  { path: "/shadows", title: "Elevation" },
  { path: "/motion", title: "Motion" },
  { path: "/components", title: "Components" },
  ...galleryClusters.map((c) => ({ path: `/components/${c.slug}`, title: c.title })),
  { path: "/forms", title: "Form elements" },
  { path: "/tables", title: "Tables" },
  { path: "/charts", title: "Charts" },
  { path: "/border-beam", title: "Border beam" },
  { path: "/appshell", title: "App shell" },
  { path: "/navigation", title: "Navigation" },
  { path: "/dashboard", title: "Dashboard" },
  { path: "/filters", title: "Filtering" },
  { path: "/filtering-advanced", title: "Advanced filtering" },
  { path: "/patterns", title: "CRUD patterns" },
  { path: "/flows", title: "Flows" },
  { path: "/origination", title: "Origination flow" },
  { path: "/pricing", title: "Pricing worksheet" },
  { path: "/modals", title: "Modals" },
  { path: "/contract", title: "Contract detail" },
  { path: "/settlement", title: "Settlement statement" },
]

export const docIndex = new Map(docOrder.map((p, i) => [p.path, i]))

/** Prev/next neighbours for a path in the reading order (null at the ends). */
export function neighbors(path: string): { prev: DocPage | null; next: DocPage | null } {
  const i = docIndex.get(path)
  if (i === undefined) return { prev: null, next: null }
  return { prev: docOrder[i - 1] ?? null, next: docOrder[i + 1] ?? null }
}
