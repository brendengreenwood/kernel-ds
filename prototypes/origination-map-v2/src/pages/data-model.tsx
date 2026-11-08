import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { GlyphIcon } from "@app/map/kit/glyph-icon"
import { LEDGER, OBJECTS, RELATIONSHIPS, type MapObject, type Status } from "@app/map/objects/catalog"

const STATUS: Record<Status, { label: string; dot: string }> = {
  built: { label: "Built", dot: "bg-primary" },
  guessed: { label: "Guessed", dot: "bg-viz-wheat-500" },
  future: { label: "Future", dot: "border border-muted-foreground" },
}

function StatusTag({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("size-2 rounded-full", STATUS[status].dot)} />
      {STATUS[status].label}
    </span>
  )
}

function ObjectCard({ o }: { o: MapObject }) {
  return (
    <section aria-labelledby={`${o.id}-h`} className="grid gap-3 rounded-[var(--radius-surface)] border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${o.id}-h`} className="text-base font-semibold">{o.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground capitalize">{o.geometry}</span>
          <StatusTag status={o.status} />
        </div>
      </div>
      <p className="max-w-[70ch] text-sm leading-5 text-muted-foreground">{o.definition}</p>
      <div className="overflow-x-auto">
        <Table className="min-w-[40rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Attribute</TableHead>
              <TableHead className="w-28">Drives</TableHead>
              <TableHead>Values</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {o.attributes.map((a) => (
              <TableRow key={a.name} className="align-top">
                <TableCell>
                  <div className="font-mono text-xs">{a.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{a.type}</div>
                </TableCell>
                <TableCell className="text-sm capitalize">{a.channel}</TableCell>
                <TableCell className="whitespace-normal">
                  {a.values && (
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1">
                      {a.values.map((v) => (
                        <span key={v.label} className="flex items-center gap-1.5 text-sm">
                          {v.glyph && <GlyphIcon type={v.glyph} hollow={v.hollow} className={cn("size-3.5", v.text)} />}
                          {v.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">{a.note}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {o.file && <p className="font-mono text-xs text-muted-foreground">{o.file}</p>}
    </section>
  )
}

export default function DataModelPage() {
  const drawn = OBJECTS.filter((o) => o.file)
  const rest = OBJECTS.filter((o) => !o.file)
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:px-6">
        <header className="grid gap-2">
          <h1 className="text-2xl font-semibold leading-8">Data model</h1>
          <p className="max-w-[70ch] text-sm leading-5 text-muted-foreground">
            The objects the map knows about, what each attribute drives on the map, and how they relate. This page reads
            the object files directly, so it always matches what the map draws.
          </p>
        </header>

        <section className="grid gap-3" aria-labelledby="objects-h">
          <h2 id="objects-h" className="text-base font-semibold">Drawn objects</h2>
          {drawn.map((o) => (
            <ObjectCard key={o.id} o={o} />
          ))}
        </section>

        <section className="grid gap-3" aria-labelledby="rest-h">
          <h2 id="rest-h" className="text-base font-semibold">Other objects</h2>
          <p className="max-w-[70ch] text-sm leading-5 text-muted-foreground">
            Not yet defined in an object file. Future objects are the sell side: rank destinations by netback.
          </p>
          <div className="overflow-x-auto">
            <Table className="min-w-[40rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Object</TableHead>
                  <TableHead>Definition</TableHead>
                  <TableHead className="w-20">Shape</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rest.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">{o.definition}</TableCell>
                    <TableCell className="text-sm capitalize">{o.geometry}</TableCell>
                    <TableCell><StatusTag status={o.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-base font-semibold">Relationships</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-[40rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RELATIONSHIPS.map((r) => (
                  <TableRow key={`${r.from}-${r.verb}`}>
                    <TableCell>
                      <span className="font-medium">{r.from}</span> <span className="text-muted-foreground">{r.verb}</span>{" "}
                      <span className="font-medium">{r.to}</span>
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">{r.note}</TableCell>
                    <TableCell><StatusTag status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="ledger-h">
          <h2 id="ledger-h" className="text-base font-semibold">Hue ledger</h2>
          <p className="max-w-[70ch] text-sm leading-5 text-muted-foreground">
            Each hue has one meaning. The ledger is full: a new kind needs a second channel or a grouping, not a new hue.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LEDGER.map((h) => (
              <div key={h.token} className="flex items-center gap-3 rounded-[var(--radius-surface)] border border-border bg-card p-3">
                <span className={cn("size-6 shrink-0 rounded-[var(--radius-control)] bg-current", h.text)} aria-hidden />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{h.claim}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{h.hue} · {h.token}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  )
}
