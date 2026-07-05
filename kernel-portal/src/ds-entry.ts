/**
 * Kernel component library barrel — the package entry for design-sync and
 * any future registry/library consumption. App code imports components
 * directly; this file exists so external tooling has one entry.
 */export * from "./components/ui/accordion"
export * from "./components/ui/alert"
export * from "./components/ui/alert-dialog"
export * from "./components/ui/aspect-ratio"
export * from "./components/ui/avatar"
export * from "./components/ui/badge"
export * from "./components/ui/border-beam"
export * from "./components/ui/breadcrumb"
export * from "./components/ui/button"
export * from "./components/ui/calendar"
export * from "./components/ui/card"
export * from "./components/ui/carousel"
export * from "./components/ui/chart"
export * from "./components/ui/checkbox"
export * from "./components/ui/collapsible"
export * from "./components/ui/command"
export * from "./components/ui/context-menu"
export * from "./components/ui/dialog"
export * from "./components/ui/drawer"
export * from "./components/ui/dropdown-menu"
export * from "./components/ui/form"
export * from "./components/ui/hover-card"
export * from "./components/ui/input"
export * from "./components/ui/input-group"
export * from "./components/ui/input-otp"
export * from "./components/ui/label"
export * from "./components/ui/menubar"
export * from "./components/ui/navigation-menu"
export * from "./components/ui/pagination"
export * from "./components/ui/popover"
export * from "./components/ui/progress"
export * from "./components/ui/radio-group"
export * from "./components/ui/resizable"
export * from "./components/ui/scroll-area"
export * from "./components/ui/select"
export * from "./components/ui/separator"
export * from "./components/ui/sheet"
export * from "./components/ui/sidebar"
export * from "./components/ui/skeleton"
export * from "./components/ui/slider"
export * from "./components/ui/sonner"
export * from "./components/ui/status-badge"
export * from "./components/ui/switch"
export * from "./components/ui/table"
export * from "./components/ui/tabs"
export * from "./components/ui/textarea"
export * from "./components/ui/toggle"
export * from "./components/ui/toggle-group"
export * from "./components/ui/tooltip"


// Fixes from the design-sync verification wave:
// sonner's toast must share the <Toaster> module instance (dual-instance trap).
export { toast } from "sonner"
// recharts primitives share ChartContainer's context only when they come from
// this bundle; Tooltip/Legend aliased to avoid clashing with Kernel exports.
export {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts"