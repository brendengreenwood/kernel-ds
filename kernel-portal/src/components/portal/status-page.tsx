import { Link } from "react-router-dom"
import { Section } from "./section"
import { cn } from "@kernel/ui/utils"
import { routeForAnchor } from "@/lib/routes"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kernel/ui"
import { componentMeta, type Maturity } from "@/lib/component-meta"

const maturityInk: Record<Maturity, string> = {
  ready: "text-success-700 dark:text-success-300",
  experimental: "text-warning-800 dark:text-warning-200",
  deprecated: "text-error-700 dark:text-error-300 line-through",
}

const maturityDot: Record<Maturity, string> = {
  ready: "bg-success-500",
  experimental: "bg-warning-500",
  deprecated: "bg-error-500",
}

function MaturityLabel({ maturity }: { maturity: Maturity }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-medium", maturityInk[maturity])}>
      <span className={cn("size-1.5 rounded-full", maturityDot[maturity])} />
      {maturity}
    </span>
  )
}

const groupLabel = {
  component: "Component",
  element: "Element",
  pattern: "Pattern",
  domain: "Domain",
  object: "Object",
} as const

export function StatusSection() {
  const counts = componentMeta.reduce(
    (acc, c) => ((acc[c.maturity] += 1), acc),
    { ready: 0, experimental: 0, deprecated: 0 } as Record<Maturity, number>
  )

  return (
    <Section
      id="status"
      eyebrow="Get started"
      title="Component status"
      lead="Every component, element, and pattern with its lifecycle stage. Experimental means usable but intentionally blocked by the note. Ready means long-term support; breaking changes come with migration guidance. Accessibility review is tracked separately and is complete for every row."
    >
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {(Object.keys(counts) as Maturity[]).map((m) => (
          <span key={m} className="inline-flex items-center gap-2">
            <MaturityLabel maturity={m} />
            <span className="font-mono text-xs text-muted-foreground">{counts[m]}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>A11y review</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {componentMeta.map((c) => (
              <TableRow key={`${c.group}-${c.name}`}>
                <TableCell className="font-medium">
                  <Link to={routeForAnchor(c.anchor)} className="hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{groupLabel[c.group]}</TableCell>
                <TableCell>
                  <MaturityLabel maturity={c.maturity} />
                </TableCell>
                <TableCell>
                  {c.a11y === "reviewed" ? (
                    <span className="text-success-700 dark:text-success-300">reviewed</span>
                  ) : (
                    <span className="text-muted-foreground">pending</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[380px] text-sm text-muted-foreground">
                  {c.note ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  )
}
