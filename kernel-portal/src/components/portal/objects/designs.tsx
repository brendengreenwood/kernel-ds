import { Section, Subhead, Demo } from "../section"
import {
  CollectionPreview,
  RecordPreview,
  WritePreview,
  QueryPreview,
  TraversalPreview,
} from "./_previews"
import { type ObjectModel, type ObjectRow } from "@/lib/objects"
import { useObjectRegistry } from "@/lib/objects/use-object-registry"
import { rules as compositionRules } from "@/lib/objects/composition"
import { registerObject } from "@/lib/objects/registry"
import { parseObjectModel } from "@/lib/objects/schema"
import { incidentJson } from "@/lib/objects/sample-incident.json"
import { Button } from "@/components/ui/button"

/**
 * Designs — the auto-derived tier described in decision 0026. This page
 * subscribes to the runtime registry (`useObjectRegistry`) and, for
 * every registered object,
 * renders every primitive (Collection, Record, Write, Query, Traversal)
 * against that object's rows using the generic preview components built
 * in segments 04 and 05. Add a third object to the registry and its full
 * design surface materializes here with no page-file edits.
 */
export function DesignsSection() {
  const { models, rows } = useObjectRegistry()
  const keys = Object.keys(models)

  return (
    <Section
      id="obj-designs"
      eyebrow="Objects · Designs"
      title="Designs"
      lead="Auto-derived from the object registry. For every object the model declares, every primitive renders — Collection, Record, Write, Query, Traversal. Add an object to the registry and its full design surface materializes here with no page-file edits."
    >
      <div className="space-y-14">
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
          <Button
            size="sm"
            disabled={"incident" in models}
            onClick={() => {
              const { model, rows: parsedRows } = parseObjectModel(incidentJson)
              registerObject(model, parsedRows)
            }}
          >
            Register sample object (Incident, from JSON)
          </Button>
          <p className="text-xs text-muted-foreground">
            Registers a non-grain object from a raw JSON string at runtime — validated by{" "}
            <code className="font-mono text-[11px]">objectModelSchema</code>, coords derived. Its
            full suite derives below with zero object-specific TSX. Session-scoped; reload resets.
          </p>
        </div>

        {keys.map((key) => (
          <ObjectDesignSuite
            key={key}
            model={models[key]}
            rows={rows[key]}
          />
        ))}

        <Subhead id="obj-designs-notes">Notes</Subhead>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The five previews (`CollectionPreview`, `RecordPreview`, `WritePreview`,
            `QueryPreview`, `TraversalPreview`) all consume{" "}
            <code className="font-mono text-[12px]">({"{ model, rows }"}) → JSX</code>.
            Iterating <code className="font-mono text-[12px]">useObjectRegistry()</code> here proves
            that generic shape.
          </li>
          <li>
            Status rendering across every primitive flows through{" "}
            <code className="font-mono text-[12px]">statusForObject()</code> in{" "}
            <code className="font-mono text-[12px]">@/lib/objects/status-map</code> (amendment
            A4).
          </li>
          <li>
            A new object needs a model (with tones on its statuses) and rows — that is the entire
            cost of a new design surface.
          </li>
        </ul>

        <Subhead id="obj-designs-composition">Composition contract</Subhead>
        <p className="text-sm text-muted-foreground">
          The doctrine below is rendered from the machine-readable manifest in{" "}
          <code className="font-mono text-[12px]">@/lib/objects/composition</code> (decision 0030) —
          also emitted as <code className="font-mono text-[12px]">/composition.json</code> for
          agents. Humans see the same rules agents do.
        </p>
        <ul className="space-y-2">
          {compositionRules.map((rule) => (
            <li
              key={rule.id}
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <code className="font-mono text-[12px] font-medium">{rule.id}</code>
                <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {rule.source}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">{rule.statement}</p>
            </li>
          ))}
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
      className="rounded-lg border border-border/60 bg-card p-6"
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
