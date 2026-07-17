/**
 * Legacy routes manifest — every pre-existing route that must remain reachable
 * after the object-centric restructure. Consumed by
 * `.mastracode/plans/ds-object-centric-restructure.proof/scripts/walk-legacy-routes.mjs`.
 *
 * Each row: { slug, path, assertion: { text, within } }
 *   - slug     : screenshot filename base (legacy-<slug>.png) and --pages= key
 *   - path     : URL path to visit on the dev server
 *   - assertion.within :
 *       "h1"    -> asserted via getByRole('heading', { level: 2 }) per Amendment A2
 *                  (portal Section renders titles in <h2>; overview is the sole
 *                   real <h1> and its assertion uses within:"h1-real")
 *       "h1-real" -> asserted via getByRole('heading', { level: 1 }) — overview page
 *       "main"  -> asserted via page.locator('main').getByText(text, { exact: false })
 *   - assertion.text : page-specific substring that is NOT present in the sidebar
 *                       (sidebar labels: Objects group + Aspects group are stripped
 *                        from candidate assertions to prevent structural collisions)
 *
 * HTTP status is not an assertion here — the SPA catch-all returns 200 for
 * unknown URLs. Assertion of a page-specific string is the only real proof.
 */
export const legacyRoutes = [
  // --- Overview / meta ---
  { slug: "overview", path: "/", assertion: { text: "Kernel Design System", within: "h1-real" } },
  { slug: "install", path: "/install", assertion: { text: "Install & usage", within: "h1" } },
  { slug: "status", path: "/status", assertion: { text: "Component status", within: "h1" } },

  // --- Foundations ---
  { slug: "colors", path: "/colors", assertion: { text: "Color", within: "h1" } },
  { slug: "typography", path: "/typography", assertion: { text: "Typography", within: "h1" } },
  { slug: "spacing", path: "/spacing", assertion: { text: "Spacing & radius", within: "h1" } },
  { slug: "shadows", path: "/shadows", assertion: { text: "Elevation", within: "h1" } },
  { slug: "motion", path: "/motion", assertion: { text: "Motion", within: "h1" } },

  // --- Elements ---
  { slug: "components", path: "/components", assertion: { text: "Components", within: "h1" } },
  { slug: "forms", path: "/forms", assertion: { text: "Form elements", within: "h1" } },
  { slug: "tables", path: "/tables", assertion: { text: "Table system", within: "h1" } },
  { slug: "charts", path: "/charts", assertion: { text: "Charts", within: "h1" } },
  { slug: "border-beam", path: "/border-beam", assertion: { text: "Border beam", within: "h1" } },

  // --- Patterns (existing; must stay reachable per do-not list) ---
  { slug: "appshell", path: "/appshell", assertion: { text: "App shell & page layout", within: "h1" } },
  { slug: "navigation", path: "/navigation", assertion: { text: "Navigation", within: "h1" } },
  { slug: "dashboard", path: "/dashboard", assertion: { text: "Dashboard", within: "h1" } },
  { slug: "filters", path: "/filters", assertion: { text: "Filtering & views", within: "h1" } },
  { slug: "filtering-advanced", path: "/filtering-advanced", assertion: { text: "Advanced filtering", within: "h1" } },
  { slug: "patterns", path: "/patterns", assertion: { text: "CRUD patterns", within: "h1" } },
  { slug: "flows", path: "/flows", assertion: { text: "Flows", within: "h1" } },
  { slug: "origination", path: "/origination", assertion: { text: "Origination flow", within: "h1" } },
  { slug: "pricing", path: "/pricing", assertion: { text: "Pricing worksheet", within: "h1" } },
  { slug: "modals", path: "/modals", assertion: { text: "Modal patterns", within: "h1" } },

  // --- Domain ---
  { slug: "contract", path: "/contract", assertion: { text: "Contract detail", within: "h1" } },
  { slug: "settlement", path: "/settlement", assertion: { text: "Settlement statement", within: "h1" } },

  // --- Standalone /workspace (outside PortalLayout — Workspace shell experiment) ---
  { slug: "workspace-legacy", path: "/workspace", assertion: { text: "corn $4.16", within: "main" } },

  // --- Component cluster pages (galleryClusters, driven by /components/:slug) ---
  // Titles are the cluster.title values from gallery-*.tsx registries.
  { slug: "c-button", path: "/components/button", assertion: { text: "Button", within: "h1" } },
  // cluster titles below are the verbatim cluster.title from gallery-*.tsx
  // (some are compound, e.g. "Input · Select · Textarea") — exact-match required
  { slug: "c-toggle", path: "/components/toggle", assertion: { text: "Toggle · Toggle group", within: "h1" } },
  { slug: "c-input", path: "/components/input", assertion: { text: "Input · Select · Textarea", within: "h1" } },
  { slug: "c-radio-group", path: "/components/radio-group", assertion: { text: "Radio group", within: "h1" } },
  { slug: "c-slider", path: "/components/slider", assertion: { text: "Slider · Input OTP", within: "h1" } },
  { slug: "c-form", path: "/components/form", assertion: { text: "Form (react-hook-form + zod)", within: "h1" } },
  { slug: "c-card", path: "/components/card", assertion: { text: "Card", within: "h1" } },
  { slug: "c-status-badge", path: "/components/status-badge", assertion: { text: "Status badges", within: "h1" } },
  { slug: "c-badge", path: "/components/badge", assertion: { text: "Badge · Avatar", within: "h1" } },
  { slug: "c-table", path: "/components/table", assertion: { text: "Table · Data table (sortable)", within: "h1" } },
  { slug: "c-progress", path: "/components/progress", assertion: { text: "Progress · Skeleton", within: "h1" } },
  { slug: "c-separator", path: "/components/separator", assertion: { text: "Separator · Aspect ratio", within: "h1" } },
  { slug: "c-alert", path: "/components/alert", assertion: { text: "Alert", within: "h1" } },
  { slug: "c-sonner", path: "/components/sonner", assertion: { text: "Sonner (toast) · Tooltip", within: "h1" } },
  { slug: "c-dialog", path: "/components/dialog", assertion: { text: "Dialog · Alert dialog", within: "h1" } },
  { slug: "c-popover", path: "/components/popover", assertion: { text: "Popover · Hover card", within: "h1" } },
  { slug: "c-sheet", path: "/components/sheet", assertion: { text: "Sheet · Drawer", within: "h1" } },
  { slug: "c-tabs", path: "/components/tabs", assertion: { text: "Tabs", within: "h1" } },
  { slug: "c-breadcrumb", path: "/components/breadcrumb", assertion: { text: "Breadcrumb · Pagination", within: "h1" } },
  { slug: "c-navigation-menu", path: "/components/navigation-menu", assertion: { text: "Navigation menu · Menubar", within: "h1" } },
  { slug: "c-dropdown-menu", path: "/components/dropdown-menu", assertion: { text: "Dropdown menu · Context menu", within: "h1" } },
  { slug: "c-command", path: "/components/command", assertion: { text: "Command · Combobox", within: "h1" } },
  { slug: "c-accordion", path: "/components/accordion", assertion: { text: "Accordion · Collapsible", within: "h1" } },
  { slug: "c-calendar", path: "/components/calendar", assertion: { text: "Calendar · Date picker", within: "h1" } },
  { slug: "c-carousel", path: "/components/carousel", assertion: { text: "Carousel", within: "h1" } },
  { slug: "c-scroll-area", path: "/components/scroll-area", assertion: { text: "Scroll area · Resizable", within: "h1" } },
]
