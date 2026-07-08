import { Link, useParams } from "react-router-dom"
import { Section, MaturityPill } from "@/components/portal/section"
import { clusterBySlug } from "@/lib/gallery-registry"
import { componentMeta, type Maturity } from "@/lib/component-meta"
import { ArrowLeft } from "lucide-react"

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
    </Section>
  )
}
