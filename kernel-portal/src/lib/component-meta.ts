/**
 * Component lifecycle registry — the single source of truth for the side
 * rail and the Component status page (decision 0006).
 *
 * Maturity is a third taxonomy, distinct from domain statuses
 * (`--status-*` / StatusBadge) and notification variants (Alert/Badge):
 *  - experimental — usable, but behavior or API may still change; the
 *    status page says why.
 *  - ready — long-term support expected; breaking changes documented.
 *  - deprecated — will be removed; the note names the replacement.
 */
export type Maturity = "experimental" | "ready" | "deprecated"

export type ComponentMeta = {
  name: string
  /** in-page anchor the side rail links to */
  anchor: string
  group: "component" | "element" | "pattern" | "domain" | "object"
  maturity: Maturity
  a11y: "reviewed" | "pending"
  note?: string
}

const MENU_DELTA =
  "Base UI behavior (documented, intended): checkbox/radio menu items stay open on click for multi-select."

export const componentMeta: ComponentMeta[] = [
  { name: "Accordion", anchor: "c-accordion", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Alert", anchor: "c-alert", group: "component", maturity: "ready", a11y: "reviewed", note: "Kernel success/warning/info variants." },
  { name: "Alert Dialog", anchor: "c-dialog", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Aspect Ratio", anchor: "c-separator", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Attachment", anchor: "c-attachment", group: "component", maturity: "ready", a11y: "reviewed", note: "Upload lifecycle carried on one `state` prop (idle/uploading/processing/error/done)." },
  { name: "Avatar", anchor: "c-badge", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Badge", anchor: "c-badge", group: "component", maturity: "ready", a11y: "reviewed", note: "Kernel success/warning/info variants." },
  { name: "Breadcrumb", anchor: "c-breadcrumb", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Bubble", anchor: "c-bubble", group: "component", maturity: "ready", a11y: "reviewed", note: "The filled surface inside a Message; seven tone variants." },
  { name: "Button", anchor: "c-button", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Button Group", anchor: "c-button-group", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Calendar", anchor: "c-calendar", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Card", anchor: "c-card", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Carousel", anchor: "c-carousel", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Chart", anchor: "charts", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Checkbox", anchor: "fe-selection", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Collapsible", anchor: "c-accordion", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Combobox", anchor: "c-combobox", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Command", anchor: "c-command", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Context Menu", anchor: "c-dropdown-menu", group: "component", maturity: "ready", a11y: "reviewed", note: MENU_DELTA },
  { name: "Data Table", anchor: "c-table", group: "component", maturity: "ready", a11y: "reviewed", note: "Composition: table + @tanstack/react-table." },
  { name: "Date Picker", anchor: "c-calendar", group: "component", maturity: "ready", a11y: "reviewed", note: "Composition: popover + calendar." },
  { name: "Dialog", anchor: "c-dialog", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Drawer", anchor: "c-sheet", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Dropdown Menu", anchor: "c-dropdown-menu", group: "component", maturity: "ready", a11y: "reviewed", note: MENU_DELTA },
  { name: "Empty", anchor: "c-empty", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Field", anchor: "c-field", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Form", anchor: "c-form", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Hover Card", anchor: "c-popover", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Input", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Input OTP", anchor: "c-slider", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Item", anchor: "c-item", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Kbd", anchor: "c-kbd", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Label", anchor: "fe-anatomy", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Menubar", anchor: "c-navigation-menu", group: "component", maturity: "ready", a11y: "reviewed", note: MENU_DELTA },
  { name: "Marker", anchor: "c-marker", group: "component", maturity: "ready", a11y: "reviewed", note: "Transcript dividers — date, session, unread." },
  { name: "Message", anchor: "c-message", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Message Scroller", anchor: "c-message-scroller", group: "component", maturity: "ready", a11y: "reviewed", note: "Autoscroll that yields to the operator; backed by @shadcn/react." },
  { name: "Native Select", anchor: "c-native-select", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Navigation Menu", anchor: "c-navigation-menu", group: "component", maturity: "ready", a11y: "reviewed", note: "Base UI behavior (documented, intended): hover-open delay tuned to 50ms." },
  { name: "Pagination", anchor: "c-breadcrumb", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Popover", anchor: "c-popover", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Progress", anchor: "c-progress", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Radio Group", anchor: "c-radio-group", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Resizable", anchor: "c-scroll-area", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Scroll Area", anchor: "c-scroll-area", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Select", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Separator", anchor: "c-separator", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Sheet", anchor: "c-sheet", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Sidebar", anchor: "appshell", group: "component", maturity: "ready", a11y: "reviewed", note: "Demonstrated by this portal's own rail and the app shell." },
  { name: "Skeleton", anchor: "c-progress", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Slider", anchor: "c-slider", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Sonner", anchor: "c-sonner", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Spinner", anchor: "c-spinner", group: "component", maturity: "ready", a11y: "reviewed", note: "role=\"status\" and an accessible label ship with it." },
  { name: "Status Badge", anchor: "c-status-badge", group: "component", maturity: "ready", a11y: "reviewed", note: "Kernel-only; domain lifecycle states (decision 0003)." },
  { name: "Switch", anchor: "fe-selection", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Table", anchor: "c-table", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Tabs", anchor: "c-tabs", group: "component", maturity: "ready", a11y: "reviewed", note: "Variants pill (primary active, default) · underline · folder; sizes compact/default/comfortable (control-height tokens); slots for leading icon, <TabCount> badge, <TabDot> notification (decision 0021). Automatic activation (arrows activate; activateOnFocus overridable) — decision 0023." },
  { name: "Textarea", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Toggle", anchor: "c-toggle", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Toggle Group", anchor: "c-toggle", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Tooltip", anchor: "c-sonner", group: "component", maturity: "ready", a11y: "reviewed" },

  { name: "Form elements", anchor: "forms", group: "element", maturity: "ready", a11y: "reviewed" },
  { name: "Tables", anchor: "tables", group: "element", maturity: "ready", a11y: "reviewed" },
  { name: "Charts", anchor: "charts", group: "element", maturity: "ready", a11y: "reviewed" },
  { name: "Border beam", anchor: "border-beam", group: "element", maturity: "ready", a11y: "reviewed", note: "Third-party effect (border-beam, MIT); opt-in borderBeam prop on Button/Input/Card." },
  { name: "Commodity tags", anchor: "colors", group: "element", maturity: "ready", a11y: "reviewed", note: "Categorical --commodity-* hues (corn/canola/soybeans/wheat) + <CommodityBadge> (decision 0013)." },
  { name: "Animated number", anchor: "dashboard", group: "element", maturity: "ready", a11y: "reviewed", note: "<AnimatedNumber> (@number-flow/react) — counts up on mount, rolls on change, honors reduced-motion (decision 0018); used on dashboard KPIs + settlement net payable." },

  { name: "App shell", anchor: "appshell", group: "pattern", maturity: "ready", a11y: "reviewed" },
  { name: "Navigation", anchor: "navigation", group: "pattern", maturity: "ready", a11y: "reviewed", note: "Module switcher + nested rail conventions for app-level navigation." },
  { name: "Dashboard", anchor: "dashboard", group: "pattern", maturity: "ready", a11y: "reviewed" },
  { name: "Filtering", anchor: "filters", group: "pattern", maturity: "ready", a11y: "reviewed" },
  { name: "Advanced filtering", anchor: "filtering-advanced", group: "pattern", maturity: "ready", a11y: "reviewed", note: "Filter builder, column controls, and date preset patterns for dense data screens." },
  { name: "CRUD patterns", anchor: "patterns", group: "pattern", maturity: "ready", a11y: "reviewed" },
  { name: "Flows", anchor: "flows", group: "pattern", maturity: "ready", a11y: "reviewed" },
  { name: "Origination flow", anchor: "origination", group: "pattern", maturity: "ready", a11y: "reviewed", note: "Offer queue, counter composer, and activity thread conventions for grain origination workflows." },
  { name: "Pricing worksheet", anchor: "pricing", group: "pattern", maturity: "ready", a11y: "reviewed", note: "Board→basis→cash-bid stack, margin ladder, and bid board. Numbers/margin math are illustrative." },
  { name: "Modals", anchor: "modals", group: "pattern", maturity: "ready", a11y: "reviewed", note: "Size ladder, footer, scrolling, dismissal, and must-choose modal rules." },

  { name: "Contract detail", anchor: "contract", group: "domain", maturity: "experimental", a11y: "reviewed", note: "Domain pattern 1 of 4; kept experimental until contract, settlement, ticket, and invoice pages share one complete domain lineup." },
  { name: "Settlement statement", anchor: "settlement", group: "domain", maturity: "experimental", a11y: "reviewed", note: "Domain pattern 2 of 4; kept experimental until contract, settlement, ticket, and invoice pages share one complete domain lineup." },

  { name: "Shell", anchor: "obj-shell", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026" },
  { name: "Workspace", anchor: "obj-workspace", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026" },
  { name: "Collection", anchor: "obj-collection", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — first Read primitive (many rows of one object)." },
  { name: "Record", anchor: "obj-record", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — second Read primitive (one row of one object)." },
  { name: "Write", anchor: "obj-write", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — write layer (form + in-place postures)." },
  { name: "Query", anchor: "obj-query", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — Aspect: narrows an object row set with predicates; yields a Collection." },
  { name: "Traversal", anchor: "obj-traversal", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — Aspect: walks declared associations to related object rows." },
  { name: "Designs", anchor: "obj-designs", group: "object", maturity: "experimental", a11y: "pending", note: "decision 0026 — auto-derived surface iterating objectRegistry through every primitive preview." },
  { name: "Substrate demo", anchor: "obj-substrate", group: "object", maturity: "experimental", a11y: "pending", note: "Decision 0027 — DOM compose vs. canvas boundary. Uses Contract stub rows and mark components (Pin, Plot, ClusterBadge, LegendSwatch)." },
  { name: "Pin", anchor: "mark-pin", group: "object", maturity: "ready", a11y: "reviewed", note: "Mark component (decision 0027). Positioned single-record marker; caller owns placement." },
  { name: "Plot", anchor: "mark-plot", group: "object", maturity: "ready", a11y: "reviewed", note: "Mark component (decision 0027). Decorative glyph for one datum on a plot or spatial view." },
  { name: "ClusterBadge", anchor: "mark-cluster-badge", group: "object", maturity: "ready", a11y: "reviewed", note: "Mark component (decision 0027). Rolled-up count when marks would overlap." },
  { name: "LegendSwatch", anchor: "mark-legend-swatch", group: "object", maturity: "ready", a11y: "reviewed", note: "Mark component (decision 0027). Legend row color-key glyph." },
]

export const components = componentMeta.filter((c) => c.group === "component")
