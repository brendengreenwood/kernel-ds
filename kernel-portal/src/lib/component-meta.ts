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
  group: "component" | "element" | "pattern" | "domain"
  maturity: Maturity
  a11y: "reviewed" | "pending"
  note?: string
}

const MENU_DELTA =
  "Base UI behavior (documented, intended): checkbox/radio menu items stay open on click for multi-select."

export const componentMeta: ComponentMeta[] = [
  { name: "Accordion", anchor: "c-accordion", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Alert", anchor: "c-alert", group: "component", maturity: "ready", a11y: "pending", note: "Kernel success/warning/info variants." },
  { name: "Alert Dialog", anchor: "c-dialog", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Aspect Ratio", anchor: "c-separator", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Avatar", anchor: "c-badge", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Badge", anchor: "c-badge", group: "component", maturity: "ready", a11y: "pending", note: "Kernel success/warning/info variants." },
  { name: "Breadcrumb", anchor: "c-breadcrumb", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Button", anchor: "c-button", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Calendar", anchor: "c-calendar", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Card", anchor: "c-card", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Carousel", anchor: "c-carousel", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Chart", anchor: "charts", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Checkbox", anchor: "fe-selection", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Collapsible", anchor: "c-accordion", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Combobox", anchor: "c-command", group: "component", maturity: "ready", a11y: "pending", note: "Composition: popover + command." },
  { name: "Command", anchor: "c-command", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Context Menu", anchor: "c-dropdown-menu", group: "component", maturity: "ready", a11y: "pending", note: MENU_DELTA },
  { name: "Data Table", anchor: "c-table", group: "component", maturity: "ready", a11y: "pending", note: "Composition: table + @tanstack/react-table." },
  { name: "Date Picker", anchor: "c-calendar", group: "component", maturity: "ready", a11y: "pending", note: "Composition: popover + calendar." },
  { name: "Dialog", anchor: "c-dialog", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Drawer", anchor: "c-sheet", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Dropdown Menu", anchor: "c-dropdown-menu", group: "component", maturity: "ready", a11y: "pending", note: MENU_DELTA },
  { name: "Form", anchor: "c-form", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Hover Card", anchor: "c-popover", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Input", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Input OTP", anchor: "c-slider", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Label", anchor: "fe-anatomy", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Menubar", anchor: "c-navigation-menu", group: "component", maturity: "ready", a11y: "pending", note: MENU_DELTA },
  { name: "Navigation Menu", anchor: "c-navigation-menu", group: "component", maturity: "ready", a11y: "pending", note: "Base UI behavior (documented, intended): hover-open delay tuned to 50ms." },
  { name: "Pagination", anchor: "c-breadcrumb", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Popover", anchor: "c-popover", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Progress", anchor: "c-progress", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Radio Group", anchor: "c-radio-group", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Resizable", anchor: "c-scroll-area", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Scroll Area", anchor: "c-scroll-area", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Select", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Separator", anchor: "c-separator", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Sheet", anchor: "c-sheet", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Sidebar", anchor: "appshell", group: "component", maturity: "ready", a11y: "pending", note: "Demonstrated by this portal's own rail and the app shell." },
  { name: "Skeleton", anchor: "c-progress", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Slider", anchor: "c-slider", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Sonner", anchor: "c-sonner", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Status Badge", anchor: "c-status-badge", group: "component", maturity: "ready", a11y: "pending", note: "Kernel-only; domain lifecycle states (decision 0003)." },
  { name: "Switch", anchor: "fe-selection", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Table", anchor: "c-table", group: "component", maturity: "ready", a11y: "pending" },
  { name: "Tabs", anchor: "c-tabs", group: "component", maturity: "ready", a11y: "reviewed", note: "Variants pill (primary active, default) · underline · folder; sizes compact/default/comfortable (control-height tokens); slots for leading icon, <TabCount> badge, <TabDot> notification (decision 0021). Automatic activation (arrows activate; activateOnFocus overridable) — decision 0023." },
  { name: "Textarea", anchor: "c-input", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Toggle", anchor: "c-toggle", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Toggle Group", anchor: "c-toggle", group: "component", maturity: "ready", a11y: "reviewed" },
  { name: "Tooltip", anchor: "c-sonner", group: "component", maturity: "ready", a11y: "pending" },

  { name: "Form elements", anchor: "forms", group: "element", maturity: "ready", a11y: "pending" },
  { name: "Tables", anchor: "tables", group: "element", maturity: "ready", a11y: "pending" },
  { name: "Charts", anchor: "charts", group: "element", maturity: "ready", a11y: "pending" },
  { name: "Border beam", anchor: "border-beam", group: "element", maturity: "experimental", a11y: "pending", note: "Third-party effect (border-beam, MIT); opt-in borderBeam prop on Button/Input/Card. Portal-only — no static-preview mirror." },
  { name: "Commodity tags", anchor: "colors", group: "element", maturity: "experimental", a11y: "pending", note: "Categorical --commodity-* hues (corn/canola/soybeans/wheat) + <CommodityBadge> (decision 0013)." },
  { name: "Animated number", anchor: "dashboard", group: "element", maturity: "experimental", a11y: "pending", note: "<AnimatedNumber> (@number-flow/react) — counts up on mount, rolls on change, honors reduced-motion (decision 0018). Portal-only; used on dashboard KPIs + settlement net payable." },

  { name: "App shell", anchor: "appshell", group: "pattern", maturity: "ready", a11y: "pending" },
  { name: "Navigation", anchor: "navigation", group: "pattern", maturity: "experimental", a11y: "pending", note: "New pattern; module switcher + nested rail conventions settling." },
  { name: "Dashboard", anchor: "dashboard", group: "pattern", maturity: "ready", a11y: "pending" },
  { name: "Filtering", anchor: "filters", group: "pattern", maturity: "ready", a11y: "pending" },
  { name: "Advanced filtering", anchor: "filtering-advanced", group: "pattern", maturity: "experimental", a11y: "pending", note: "New pattern; builder operator set and persistence model settling." },
  { name: "CRUD patterns", anchor: "patterns", group: "pattern", maturity: "ready", a11y: "pending" },
  { name: "Flows", anchor: "flows", group: "pattern", maturity: "ready", a11y: "pending" },
  { name: "Origination flow", anchor: "origination", group: "pattern", maturity: "experimental", a11y: "pending", note: "New pattern; queue actions and counter-expiry conventions settling." },
  { name: "Pricing worksheet", anchor: "pricing", group: "pattern", maturity: "experimental", a11y: "pending", note: "New pattern; board→basis→cash-bid stack, margin ladder, and bid board. Numbers/margin math are illustrative." },
  { name: "Modals", anchor: "modals", group: "pattern", maturity: "experimental", a11y: "pending", note: "New pattern; size ladder and must-choose rules settling." },

  { name: "Contract detail", anchor: "contract", group: "domain", maturity: "experimental", a11y: "pending", note: "Domain pattern 1 of 4; API settling while the lineup lands." },
  { name: "Settlement statement", anchor: "settlement", group: "domain", maturity: "experimental", a11y: "pending", note: "Domain pattern 2 of 4; money math reconciles to contract-detail fills." },
]

export const components = componentMeta.filter((c) => c.group === "component")
