import { Section, Subhead, Demo } from "../section"
import {
  CollectionPreview,
  RecordPreview,
  WritePreview,
  QueryPreview,
  TraversalPreview,
} from "./_previews"
import {
  objectRegistry,
  objectRowsRegistry,
  type ObjectKey,
  type ObjectModel,
  type ObjectRow,
} from "@/lib/objects"

/**
 * Designs — the auto-derived tier described in decision 0026. This page
 * iterates `objectRegistry` and, for every object the model declares,
 * renders every primitive (Collection, Record, Write, Query, Traversal)
 * against that object's rows using the generic preview components built
 * in segments 04 and 05. Add a third object to the registry and its full
 * design surface materializes here with no page-file edits.
 */
export function DesignsSection() {
  const keys = Object.keys(objectRegistry) as ObjectKey[]

  return (
    <Section
      id="obj-designs"
      eyebrow="Objects · Designs"
      title="Designs"
      lead="Auto-derived from the object registry. For every object the model declares, every primitive renders — Collection, Record, Write, Query, Traversal. Add an object to the registry and its full design surface materializes here with no page-file edits."
    >
      <div className="space-y-14">
        {keys.map((key) => (
          <ObjectDesignSuite
            key={key}
            model={objectRegistry[key]}
            rows={objectRowsRegistry[key]}
          />
        ))}

        <Subhead id="obj-designs-notes">Notes</Subhead>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The five previews (`CollectionPreview`, `RecordPreview`, `WritePreview`,
            `QueryPreview`, `TraversalPreview`) all consume{" "}
            <code className="font-mono text-[12px]">({"{ model, rows }"}) → JSX</code>.
            Iterating <code className="font-mono text-[12px]">objectRegistry</code> here proves
            that generic shape.
          </li>
          <li>
            Status rendering across every primitive flows through{" "}
            <code className="font-mono text-[12px]">statusForObject()</code> in{" "}
            <code className="font-mono text-[12px]">@/lib/objects/status-map</code> (amendment
            A4).
          </li>
          <li>
            A new object needs a model, rows, and a status mapper entry — that is the entire
            cost of a new design surface.
          </li>
        </ul>
      </div>
    </Section>
  )
}

function ObjectDesignSuite({
  model,
  rows,
}: {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
}) {
  const first = rows[0]
  return (
    <section
      aria-labelledby={`designs-${model.key}`}
      className="rounded-xl border border-border/60 bg-card p-6"
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <h3
            id={`designs-${model.key}`}
            className="text-lg font-semibold tracking-tight"
          >
            {model.label}
          </h3>
          <p className="text-sm text-muted-foreground">
            {rows.length} rows · {model.fields.length} fields · {model.statuses.length} statuses
            {model.associations.length > 0
              ? ` · ${model.associations.length} association${model.associations.length === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <span className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {model.key}
        </span>
      </header>

      <div className="space-y-8">
        <Subsurface title="Collection">
          <CollectionPreview model={model} rows={rows} maxRows={5} />
        </Subsurface>

        {first ? (
          <Subsurface title="Record">
            <RecordPreview model={model} row={first} />
          </Subsurface>
        ) : null}

        <Subsurface title="Write">
          <WritePreview model={model} rows={rows} />
        </Subsurface>

        <Subsurface title="Query">
          <QueryPreview model={model} rows={rows} />
        </Subsurface>

        <Subsurface title="Traversal">
          <TraversalPreview model={model} rows={rows} />
        </Subsurface>
      </div>
    </section>
  )
}

function Subsurface({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Subhead>{title}</Subhead>
      <Demo className="block p-0">{children}</Demo>
    </div>
  )
}
