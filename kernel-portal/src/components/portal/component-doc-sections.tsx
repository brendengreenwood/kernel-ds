/**
 * ComponentDocSections — renders a component's structured documentation
 * (decision 0035) on its portal page. Given a `ComponentDoc`, it walks the
 * typed `docs` array and renders each block by `kind`. Empty blocks render
 * nothing; each rendered section is wrapped in a
 * `data-slot="doc-section-{kind}"` div so the Playwright proof can target it.
 */
import type {
  ComponentDoc,
  DocBlock,
} from "@/lib/component-docs/schema"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function SectionShell({
  kind,
  title,
  children,
}: {
  kind: DocBlock["kind"]
  title: string
  children: React.ReactNode
}) {
  return (
    <div data-slot={`doc-section-${kind}`} className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function GuidelinesSection({
  dos,
  donts,
}: {
  dos: string[]
  donts: string[]
}) {
  return (
    <SectionShell kind="guidelines" title="Guidelines">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-success-700 dark:text-success-300">
            Do
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {dos.map((d) => (
              <li key={d} className="flex gap-2">
                <span aria-hidden className="text-success-600">
                  +
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-error-700 dark:text-error-300">
            Don&apos;t
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {donts.map((d) => (
              <li key={d} className="flex gap-2">
                <span aria-hidden className="text-error-600">
                  −
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}

function UseCasesSection({
  use,
  dontUse,
}: {
  use: string[]
  dontUse: string[]
}) {
  return (
    <SectionShell kind="useCases" title="When to use">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Use when
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {use.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Don&apos;t use when
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {dontUse.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}

function VariantsSection({
  groups,
}: {
  groups: { axis: string; keys: string[]; defaultKey?: string }[]
}) {
  return (
    <SectionShell kind="variants" title="Variants">
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.axis} className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">{g.axis}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.keys.map((k) => (
                <Badge
                  key={k}
                  variant={k === g.defaultKey ? "default" : "outline"}
                  className="font-mono"
                >
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

function AnatomySection({ slots }: { slots: string[] }) {
  return (
    <SectionShell kind="anatomy" title="Anatomy">
      <div className="flex flex-wrap gap-1.5">
        {slots.map((s) => (
          <Badge key={s} variant="secondary" className="font-mono">
            {s}
          </Badge>
        ))}
      </div>
    </SectionShell>
  )
}

function ApiSection({
  props,
}: {
  props: {
    name: string
    type: string
    default?: string
    description?: string
  }[]
}) {
  return (
    <SectionShell kind="api" title="API">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="font-mono text-xs">{p.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {p.type}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {p.default ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {p.description ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionShell>
  )
}

function StatesSection({
  items,
}: {
  items: { name: string; description: string }[]
}) {
  return (
    <SectionShell kind="states" title="States">
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.name} className="flex gap-2">
            <span className="font-mono text-xs text-foreground">{i.name}</span>
            <span>—</span>
            <span>{i.description}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function AccessibilitySection({
  role,
  ariaAttributes,
  keyboardInteractions,
}: {
  role?: string
  ariaAttributes?: string[]
  keyboardInteractions?: { key: string; action: string }[]
}) {
  return (
    <SectionShell kind="accessibility" title="Accessibility">
      <div className="space-y-3 text-sm text-muted-foreground">
        {role ? (
          <p>
            <span className="font-medium text-foreground">Role:</span>{" "}
            <span className="font-mono text-xs">{role}</span>
          </p>
        ) : null}
        {ariaAttributes && ariaAttributes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {ariaAttributes.map((a) => (
              <Badge key={a} variant="outline" className="font-mono">
                {a}
              </Badge>
            ))}
          </div>
        ) : null}
        {keyboardInteractions && keyboardInteractions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keyboardInteractions.map((k) => (
                <TableRow key={k.key}>
                  <TableCell className="font-mono text-xs">{k.key}</TableCell>
                  <TableCell className="text-sm">{k.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </SectionShell>
  )
}

function DecisionsSection({
  refs,
}: {
  refs: { number: number; title: string }[]
}) {
  return (
    <SectionShell kind="decisions" title="Decisions">
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {refs.map((r) => (
          <li key={r.number} className="flex gap-2">
            <span className="font-mono text-xs text-foreground">
              {String(r.number).padStart(4, "0")}
            </span>
            <span>{r.title}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

/** Render one typed doc block. Returns null for empty blocks. */
function renderBlock(block: DocBlock): React.ReactNode {
  switch (block.kind) {
    case "guidelines":
      if (block.dos.length === 0 && block.donts.length === 0) return null
      return <GuidelinesSection dos={block.dos} donts={block.donts} />
    case "useCases":
      if (block.use.length === 0 && block.dontUse.length === 0) return null
      return <UseCasesSection use={block.use} dontUse={block.dontUse} />
    case "variants":
      if (block.groups.length === 0) return null
      return <VariantsSection groups={block.groups} />
    case "anatomy":
      if (block.slots.length === 0) return null
      return <AnatomySection slots={block.slots} />
    case "api":
      if (block.props.length === 0) return null
      return <ApiSection props={block.props} />
    case "states":
      if (block.items.length === 0) return null
      return <StatesSection items={block.items} />
    case "accessibility":
      if (
        !block.role &&
        (!block.ariaAttributes || block.ariaAttributes.length === 0) &&
        (!block.keyboardInteractions ||
          block.keyboardInteractions.length === 0)
      )
        return null
      return (
        <AccessibilitySection
          role={block.role}
          ariaAttributes={block.ariaAttributes}
          keyboardInteractions={block.keyboardInteractions}
        />
      )
    case "decisions":
      if (block.refs.length === 0) return null
      return <DecisionsSection refs={block.refs} />
  }
}

/**
 * Render all doc sections for a component. When the doc has no renderable
 * blocks (minimal-conformance entities), renders nothing so the page falls
 * back to just the demo.
 */
export default function ComponentDocSections({ doc }: { doc: ComponentDoc }) {
  const rendered: { key: string; node: React.ReactNode }[] = []
  doc.docs.forEach((block, i) => {
    const node = renderBlock(block)
    if (node) rendered.push({ key: `${block.kind}-${i}`, node })
  })

  if (rendered.length === 0) return null

  return (
    <div className="mb-10 space-y-8">
      {rendered.map(({ key, node }, i) => (
        <div key={key}>
          {i > 0 ? <Separator className="mb-8" /> : null}
          {node}
        </div>
      ))}
    </div>
  )
}
