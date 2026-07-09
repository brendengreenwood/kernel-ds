"use client"

import * as React from "react"
import { Plus, X, Columns3, GripVertical } from "@/components/ui/icon"
import { useAutoAnimate } from "@formkit/auto-animate/react"

import { cn } from "@/lib/utils"
import { autoAnimateConfig } from "@/lib/motion"
import { Section, Subhead } from "./section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* -- filter builder ------------------------------------------------------ */

const FIELDS = ["Grain", "Basis", "Futures month", "Delivery window", "Farm", "Status"]
const OPS: Record<string, string[]> = {
  Grain: ["is", "is not"],
  Basis: ["≤", "≥", "between"],
  "Futures month": ["is", "before", "after"],
  "Delivery window": ["overlaps", "within"],
  Farm: ["is", "is any of"],
  Status: ["is", "is any of", "is not"],
}

type Condition = { id: number; field: string; op: string; value: string }

function FilterBuilder() {
  const [rows, setRows] = React.useState<Condition[]>([
    { id: 1, field: "Grain", op: "is", value: "Corn" },
    { id: 2, field: "Basis", op: "≤", value: "−0.15" },
    { id: 3, field: "Delivery window", op: "overlaps", value: "Oct 1 – Nov 15" },
  ])
  const next = React.useRef(4)
  const [listRef] = useAutoAnimate<HTMLDivElement>(autoAnimateConfig)

  const update = (id: number, patch: Partial<Condition>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  return (
    <div className="rounded-lg border bg-card">
      <div ref={listRef} className="flex flex-col gap-2.5 p-4">
        {rows.map((r, i) => (
          <div key={r.id} className="flex flex-wrap items-center gap-2">
            <span className="w-14 shrink-0 text-right text-xs font-medium text-muted-foreground">
              {i === 0 ? "Where" : "And"}
            </span>
            <Select value={r.field} onValueChange={(v) => update(r.id, { field: v as string, op: OPS[v as string][0] })}>
              <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={r.op} onValueChange={(v) => update(r.id, { op: v as string })}>
              <SelectTrigger size="sm" className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPS[r.field].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              value={r.value}
              onChange={(e) => update(r.id, { value: e.target.value })}
              className="h-(--control-h-sm) w-44 font-mono text-base md:text-[0.8rem]"
            />
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Remove condition"
              onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
            >
              <X />
            </Button>
          </div>
        ))}
        <div>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setRows((rs) => [...rs, { id: next.current++, field: "Farm", op: "is", value: "" }])}
          >
            <Plus /> Add condition
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t bg-muted/40 px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground">matches 23 of 210 contracts</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setRows([])}>Clear</Button>
          <Button size="sm" variant="outline">Save as view</Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    </div>
  )
}

/* -- column controls ------------------------------------------------------ */

const COLUMNS = [
  ["Load", true, true],
  ["Farm", true, false],
  ["Grain", true, false],
  ["Basis", true, false],
  ["Futures", false, false],
  ["Cash price", true, false],
  ["Delivered", false, false],
] as const

function ColumnControls() {
  return (
    <div className="flex min-h-44 items-start rounded-lg border bg-card p-4">
      <Popover>
        <PopoverTrigger
          render={<Button size="sm" variant="outline"><Columns3 /> Columns <span className="font-mono text-[11px] text-muted-foreground">5/7</span></Button>}
        />
        <PopoverContent align="start" className="w-56 p-1.5">
          <div className="px-2 pt-1.5 pb-2 text-xs font-medium text-muted-foreground">Visible columns</div>
          {COLUMNS.map(([name, on, locked]) => (
            <Label
              key={name}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-normal hover:bg-muted",
                locked && "opacity-60"
              )}
            >
              <Checkbox defaultChecked={on} disabled={locked} />
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <GripVertical className="size-3.5 text-muted-foreground/60" />
            </Label>
          ))}
          <div className="mt-1 border-t px-2 pt-2 pb-1">
            <button className="text-xs font-medium text-primary hover:underline">Reset to default</button>
          </div>
        </PopoverContent>
      </Popover>
      <p className="ml-5 hidden max-w-56 text-xs leading-relaxed text-muted-foreground sm:block">
        The identity column is locked — a table always keeps its anchor.
        Order is drag-to-reorder; the choice persists per saved view.
      </p>
    </div>
  )
}

/* -- date-range presets ---------------------------------------------------- */

const PRESETS = ["Today", "7D", "30D", "Crop year", "Custom"]

function DatePresets() {
  const [preset, setPreset] = React.useState("Crop year")
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex gap-0.5 rounded-md border bg-muted p-[3px]">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-[13px] font-medium whitespace-nowrap",
                p === preset ? "bg-card font-semibold text-foreground shadow-xs" : "text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        {preset === "Custom" ? (
          <div className="flex items-center gap-2">
            <Input className="h-(--control-h-sm) w-32 font-mono" defaultValue="Oct 1, 2026" />
            <span className="text-muted-foreground">–</span>
            <Input className="h-(--control-h-sm) w-32 font-mono" defaultValue="Nov 15, 2026" />
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {preset === "Crop year" ? "Sep 1, 2025 – Aug 31, 2026" : "resolved range shown here"}
          </span>
        )}
      </div>
    </div>
  )
}

export function FilteringAdvancedSection() {
  return (
    <Section
      id="filtering-advanced"
      eyebrow="Patterns"
      title="Advanced filtering"
      lead="Quick chips answer the everyday questions; a pricing desk also asks compound ones — corn under −0.15 basis delivering before November. The builder composes those conditions, column controls shape the table, and date presets speak the domain's calendar. Saved views (see Filtering & views) persist the result."
    >
      <Subhead>Filter builder</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        One row per condition — field, operator, value — joined with And.
        Operators change with the field type; the footer shows the match
        count live so a bad filter is obvious before it&rsquo;s applied.
        Reach for the builder past three conditions; below that, chips win.
      </p>
      <FilterBuilder />

      <Subhead>Column controls</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Data-heavy tables let the merchant choose their columns instead of
        showing everything.
      </p>
      <ColumnControls />

      <Subhead>Date-range presets</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Date filters offer the ranges merchants actually use — including the
        crop year, which no generic date picker knows about. Custom exposes
        plain range inputs.
      </p>
      <DatePresets />
    </Section>
  )
}
