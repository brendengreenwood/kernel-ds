/**
 * Per-page information architecture (decision 0011): every side-rail item
 * is its own route. Section slugs deliberately reuse the old single-page
 * anchor ids so legacy `#hash` links redirect cleanly.
 */
export const sectionRoutes: Record<string, string> = {
  overview: "/",
  install: "/install",
  status: "/status",
  colors: "/colors",
  typography: "/typography",
  spacing: "/spacing",
  shadows: "/shadows",
  motion: "/motion",
  components: "/components",
  forms: "/forms",
  tables: "/tables",
  charts: "/charts",
  "border-beam": "/border-beam",
  appshell: "/appshell",
  navigation: "/navigation",
  dashboard: "/dashboard",
  filters: "/filters",
  "filtering-advanced": "/filtering-advanced",
  patterns: "/patterns",
  flows: "/flows",
  origination: "/origination",
  pricing: "/pricing",
  modals: "/modals",
  contract: "/contract",
  settlement: "/settlement",
  substrate: "/substrate",
  "obj-shell": "/shell",
  "obj-workspace": "/workspace-obj",
}

/** Where a legacy in-page anchor lives in the per-page IA. */
export function routeForAnchor(anchor: string): string {
  if (anchor.startsWith("c-")) return `/components/${anchor.slice(2)}`
  if (anchor.startsWith("fe-")) return `/forms#${anchor}`
  return sectionRoutes[anchor] ?? "/"
}
