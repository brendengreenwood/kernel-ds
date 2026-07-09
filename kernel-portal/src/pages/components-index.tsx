import { Link } from "react-router-dom"
import { Section, MaturityPill } from "@/components/portal/section"
import { Badge } from "@/components/ui/badge"
import { galleryClusters } from "@/lib/gallery-registry"
import { componentMeta, type Maturity } from "@/lib/component-meta"
import { ChevronRight } from "@/components/ui/icon"

const all = [
  "Accordion","Alert","Alert Dialog","Aspect Ratio","Avatar","Badge","Breadcrumb",
  "Button","Calendar","Card","Carousel","Chart","Checkbox","Collapsible","Combobox",
  "Command","Context Menu","Data Table","Date Picker","Dialog","Drawer","Dropdown Menu",
  "Form","Hover Card","Input","Input OTP","Label","Menubar","Navigation Menu","Pagination",
  "Popover","Progress","Radio Group","Resizable","Scroll Area","Select","Separator","Sheet",
  "Sidebar","Skeleton","Slider","Sonner","Switch","Table","Tabs","Textarea","Toggle",
  "Toggle Group","Tooltip",
]

/** Sharpest maturity among the components that share a cluster anchor. */
const RANK: Record<Maturity, number> = { deprecated: 3, experimental: 2, ready: 1 }
function clusterMaturity(anchor: string): Maturity {
  const members = componentMeta.filter((c) => c.anchor === anchor)
  return members.reduce<Maturity>(
    (worst, c) => (RANK[c.maturity] > RANK[worst] ? c.maturity : worst),
    "ready"
  )
}

const groupOrder = ["Actions", "Forms & input", "Data display", "Feedback & overlay", "Navigation", "Menus & command", "Disclosure", "Date & media", "Layout"]

export default function ComponentsIndex() {
  const byGroup = groupOrder
    .map((g) => ({ group: g, items: galleryClusters.filter((c) => c.group === g) }))
    .filter((g) => g.items.length)

  return (
    <Section
      id="components"
      eyebrow="Elements"
      title="Components"
      lead="The full shadcn/ui registry, rendered with Kernel tokens and grouped by role. Every element reads exclusively from theme variables, so the whole gallery re-themes on toggle. Pick a component for its own page."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="font-mono">{all.length} components</Badge>
        {all.map((c) => (
          <span
            key={c}
            className="rounded-full border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        {byGroup.map(({ group, items }) => (
          <div key={group}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {group}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((c) => (
                <Link
                  key={c.slug}
                  to={`/components/${c.slug}`}
                  className="group flex items-center gap-2 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-ring hover:bg-accent/40"
                >
                  <span className="font-medium">{c.title}</span>
                  <MaturityPill maturity={clusterMaturity(c.anchor)} />
                  <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
