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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, XCircle } from "@/components/ui/icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CodeBlock } from "@/components/ui/code-block"

/**
 * Render prose that may contain backtick-delimited terms (`outline`,
 * `aria-label`) as styled inline <code>, matching the inline-code
 * convention used across the Foundations and Patterns pages. Splits on
 * backtick pairs; odd segments are code, even segments are plain text.
 */
export function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/`([^`]+)`/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
      >
        {part}
      </code>
    ) : (
      part
    )
  )
}

/**
 * A one-line eyebrow per block kind, shown above each section title so a
 * reader scanning the page reads intent, not just section names.
 */
const SECTION_EYEBROW: Record<DocBlock["kind"], string> = {
  useCases: "When to reach for it",
  guidelines: "Best practices",
  variants: "Configuration",
  anatomy: "Structure",
  api: "Props",
  states: "Interaction",
  accessibility: "Inclusive design",
  decisions: "Rationale",
  examples: "Usage",
}

/**
 * The heading shown for each section. Single source of truth shared by the
 * section shells and the "On this page" nav so the two never drift.
 */
const SECTION_TITLE: Record<DocBlock["kind"], string> = {
  useCases: "When to use",
  guidelines: "Guidelines",
  variants: "Variants",
  anatomy: "Anatomy",
  api: "API",
  states: "States",
  accessibility: "Accessibility",
  decisions: "Related decisions",
  examples: "Examples",
}

/** The DOM id for a section's Card — the "On this page" nav anchors to it. */
export function docSectionId(kind: DocBlock["kind"]): string {
  return `doc-${kind}`
}

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
    <Card
      id={docSectionId(kind)}
      data-slot={`doc-section-${kind}`}
      className="min-w-0 scroll-mt-24 gap-4 [--card-spacing:--spacing(5)]"
    >
      <CardHeader className="gap-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {SECTION_EYEBROW[kind]}
        </p>
        <CardTitle className="text-base font-semibold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-success-500/30 bg-success-500/5 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success-700 dark:text-success-300">
            <CheckCircle2 className="size-3.5" aria-hidden />
            Do
          </p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
            {dos.map((d) => (
              <li key={d} className="flex gap-2">
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-success-600 dark:text-success-400"
                />
                <span className="min-w-0">{renderInlineCode(d)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 rounded-lg border border-error-500/30 bg-error-500/5 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-error-700 dark:text-error-300">
            <XCircle className="size-3.5" aria-hidden />
            Don&apos;t
          </p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
            {donts.map((d) => (
              <li key={d} className="flex gap-2">
                <XCircle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-error-600 dark:text-error-400"
                />
                <span className="min-w-0">{d}</span>
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
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-success-700 dark:text-success-300">
            Use for
          </p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
            {use.map((u) => (
              <li key={u} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success-500"
                />
                <span className="min-w-0">{renderInlineCode(u)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 rounded-lg border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-error-700 dark:text-error-300">
            Don&apos;t use for
          </p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
            {dontUse.map((u) => (
              <li key={u} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-error-500"
                />
                <span>{renderInlineCode(u)}</span>
              </li>
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
  groups: {
    axis: string
    keys: (string | { key: string; description: string })[]
    defaultKey?: string
  }[]
}) {
  return (
    <SectionShell kind="variants" title="Variants">
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.axis} className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground/70">
              {g.axis}
            </p>
            <div className="overflow-hidden rounded-lg border divide-y divide-border/60">
              {g.keys.map((raw) => {
                const k = typeof raw === "string" ? raw : raw.key
                const desc = typeof raw === "string" ? null : raw.description
                const isDefault = k === g.defaultKey
                return (
                  <div
                    key={k}
                    className="grid items-baseline gap-1.5 px-3 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4"
                  >
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isDefault ? "default" : "outline"}
                        className="font-mono shrink-0"
                      >
                        {k}
                      </Badge>
                      {isDefault ? (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                          default
                        </span>
                      ) : null}
                    </div>
                    {desc ? (
                      <span className="text-sm text-muted-foreground">
                        {desc}
                      </span>
                    ) : null}
                  </div>
                )
              })}
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
      <div className="overflow-hidden rounded-lg border">
        {slots.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] text-muted-foreground">
              {i + 1}
            </span>
            <code className="font-mono text-xs text-foreground">{s}</code>
          </div>
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
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead>Prop</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.map((p) => (
              <TableRow key={p.name}>
                <TableCell>
                  <code className="rounded border bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                    {p.name}
                  </code>
                </TableCell>
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
      </div>
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
      <dl className="overflow-hidden rounded-lg border">
        {items.map((i) => (
          <div
            key={i.name}
            className="grid gap-2 border-b px-3 py-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-4"
          >
            <dt>
              <Badge
                variant="outline"
                className="h-auto whitespace-normal text-left font-mono leading-snug"
              >
                {i.name}
              </Badge>
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {i.description}
            </dd>
          </div>
        ))}
      </dl>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </span>
            <Badge variant="secondary" className="font-mono">
              {role}
            </Badge>
          </div>
        ) : null}
        {ariaAttributes && ariaAttributes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              ARIA attributes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ariaAttributes.map((a) => (
                <Badge key={a} variant="outline" className="font-mono">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {keyboardInteractions && keyboardInteractions.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Key</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyboardInteractions.map((k) => (
                  <TableRow key={k.key}>
                    <TableCell>
                      <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs text-foreground shadow-xs">
                        {k.key}
                      </kbd>
                    </TableCell>
                    <TableCell className="text-sm">{k.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
    <SectionShell kind="decisions" title="Related decisions">
      <ul className="overflow-hidden rounded-lg border">
        {refs.map((r) => (
          <li
            key={r.number}
            className="flex items-start gap-3 border-b px-3 py-3 last:border-b-0"
          >
            <Badge variant="secondary" className="shrink-0 font-mono">
              #{String(r.number).padStart(4, "0")}
            </Badge>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {r.title}
            </span>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function ExamplesSection({
  items,
}: {
  items: { title: string; description?: string; code: string; language?: string }[]
}) {
  return (
    <SectionShell kind="examples" title="Examples">
      <div className="grid gap-5">
        {items.map((ex) => (
          <div key={ex.title} className="grid gap-2">
            <div className="grid gap-0.5">
              <p className="text-sm font-medium text-foreground">{ex.title}</p>
              {ex.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ex.description}
                </p>
              ) : null}
            </div>
            <CodeBlock code={ex.code} lang={ex.language ?? "tsx"} />
          </div>
        ))}
      </div>
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
    case "examples":
      if (block.items.length === 0) return null
      return <ExamplesSection items={block.items} />
  }
}

/**
 * Walk a doc's blocks and return only those that actually render, in order,
 * each paired with its rendered node. Both the page renderer and the
 * "On this page" nav read from this one function so they can never disagree
 * about which sections exist.
 */
function renderedBlocks(
  doc: ComponentDoc,
): { key: string; kind: DocBlock["kind"]; node: React.ReactNode }[] {
  const out: { key: string; kind: DocBlock["kind"]; node: React.ReactNode }[] =
    []
  doc.docs.forEach((block, i) => {
    const node = renderBlock(block)
    if (node) out.push({ key: `${block.kind}-${i}`, kind: block.kind, node })
  })
  return out
}

/**
 * An ordered list of the sections that will actually render for a doc —
 * `{ kind, title, id }` per section. The "On this page" nav consumes this.
 * Empty for minimal-conformance entities (the page shows just the demo).
 */
export function docSectionNav(
  doc: ComponentDoc,
): { kind: DocBlock["kind"]; title: string; id: string }[] {
  return renderedBlocks(doc).map(({ kind }) => ({
    kind,
    title: SECTION_TITLE[kind],
    id: docSectionId(kind),
  }))
}

/**
 * Render all doc sections for a component. When the doc has no renderable
 * blocks (minimal-conformance entities), renders nothing so the page falls
 * back to just the demo.
 */
export default function ComponentDocSections({ doc }: { doc: ComponentDoc }) {
  const rendered = renderedBlocks(doc)
  if (rendered.length === 0) return null

  return (
    <div className="mb-10 grid min-w-0 gap-4">
      {rendered.map(({ key, node }) => (
        <div key={key} className="min-w-0">
          {node}
        </div>
      ))}
    </div>
  )
}
