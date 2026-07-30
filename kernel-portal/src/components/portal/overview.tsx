import { Badge } from "@kernel/ui"

const meta = [
  ["Theme", "Kernel"],
  ["Base", "shadcn/ui"],
  ["Version", "1.0.0"],
  ["Modes", "Light · Dark"],
]

export function OverviewSection() {
  return (
    <section id="overview" className="scroll-mt-20 pt-6">
      <Badge variant="secondary" className="gap-2 font-mono">
        <span className="size-1.5 rounded-full bg-primary" />
        internal design system
      </Badge>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">Kernel Design System</h1>
      <p className="mt-4 max-w-xl text-lg leading-snug text-muted-foreground">
        The shadcn/ui foundation for Kernel — the platform our merchants and
        origination teams use for pricing strategy and sales execution. One
        source of truth for color, type, spacing, and components, in light and
        dark.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {meta.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground"
          >
            {k} <span className="font-semibold text-foreground">{v}</span>
          </span>
        ))}
      </div>
      <div className="mt-8 max-w-xl rounded-md border bg-card p-4">
        <div className="text-sm font-semibold">Voice & content</div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Example copy everywhere in this system lives in the grain world —
          loads, contracts, farms, bushels, basis, settlement. No lorem
          ipsum, no generic SaaS filler: realistic copy is how a demo proves
          a component survives real data (long farm names, negative basis,
          six-digit bushel counts).
        </p>
      </div>
    </section>
  )
}
