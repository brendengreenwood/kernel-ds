import { Link, useParams } from "react-router-dom"
import { Section, MaturityPill } from "@/components/portal/section"
import { galleryClusters, clusterBySlug } from "@/lib/gallery-registry"
import { componentMeta, type Maturity } from "@/lib/component-meta"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"

const RANK: Record<Maturity, number> = { deprecated: 3, experimental: 2, ready: 1 }
function clusterMaturity(anchor: string): Maturity {
  return componentMeta
    .filter((c) => c.anchor === anchor)
    .reduce<Maturity>((worst, c) => (RANK[c.maturity] > RANK[worst] ? c.maturity : worst), "ready")
}

export default function ComponentPage() {
  const { slug } = useParams()
  const cluster = slug ? clusterBySlug.get(slug) : undefined

  if (!cluster) {
    return (
      <Section id="components" eyebrow="Elements" title="Component not found" lead="That component doesn't exist. Browse the full set from the index.">
        <Link to="/components" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" /> All components
        </Link>
      </Section>
    )
  }

  const idx = galleryClusters.findIndex((c) => c.slug === cluster.slug)
  const prev = galleryClusters[idx - 1]
  const next = galleryClusters[idx + 1]
  const Demo = cluster.demo
  const members = componentMeta.filter((c) => c.anchor === cluster.anchor)

  return (
    <Section
      id={`c-${cluster.slug}`}
      eyebrow={cluster.group}
      title={cluster.title}
      lead={undefined}
    >
      <div className="-mt-4 mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to="/components" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All components
        </Link>
        <MaturityPill maturity={clusterMaturity(cluster.anchor)} />
        {members.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {members.map((m) => (
              <span key={m.name} className="rounded-full border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {m.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Demo />

      <nav className="mt-14 flex items-stretch gap-3 border-t pt-6">
        {prev ? (
          <Link to={`/components/${prev.slug}`} className="group flex flex-1 items-center gap-2 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-ring hover:bg-accent/40">
            <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Previous</span>
              <span className="block truncate font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link to={`/components/${next.slug}`} className="group flex flex-1 items-center justify-end gap-2 rounded-lg border bg-card px-4 py-3 text-right transition-colors hover:border-ring hover:bg-accent/40">
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Next</span>
              <span className="block truncate font-medium">{next.title}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </Section>
  )
}
