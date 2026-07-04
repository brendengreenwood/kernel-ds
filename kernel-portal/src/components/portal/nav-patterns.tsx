"use client"

import * as React from "react"
import {
  Sprout,
  ChevronDown,
  ChevronRight,
  LineChart,
  Handshake,
  LayoutDashboard,
  FileText,
  Truck,
  Home,
  Banknote,
  MoreHorizontal,
  Check,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Section, Subhead } from "./section"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* -- grouped rail with a nested area ------------------------------------ */

const rail: {
  label: string
  items: { icon: React.ElementType; name: string; on?: boolean; count?: string; children?: { name: string; on?: boolean }[] }[]
}[] = [
  { label: "Pricing", items: [
    { icon: LayoutDashboard, name: "Dashboard" },
    { icon: LineChart, name: "Bids & basis" },
    { icon: FileText, name: "Contracts", count: "128" },
  ]},
  { label: "Origination", items: [
    { icon: Handshake, name: "Offers", on: true, count: "12", children: [
      { name: "Open", on: true },
      { name: "Countered" },
      { name: "Expired" },
    ]},
    { icon: Home, name: "Producers" },
  ]},
  { label: "Records", items: [
    { icon: Truck, name: "Loads" },
    { icon: Banknote, name: "Settlements" },
  ]},
]

function GroupedRail() {
  return (
    <div className="grid min-h-96 grid-cols-1 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-0.5 border-b bg-sidebar p-2.5 md:border-r md:border-b-0">
        {rail.map((g) => (
          <React.Fragment key={g.label}>
            <div className="px-2 pt-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{g.label}</div>
            {g.items.map((it) => (
              <React.Fragment key={it.name}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium",
                    it.on ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <it.icon className="size-[15px] shrink-0" />
                  <span className="min-w-0 truncate">{it.name}</span>
                  {it.count && (
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">{it.count}</span>
                  )}
                  {it.children && <ChevronDown className="size-3.5 shrink-0 opacity-60" />}
                </div>
                {it.children?.map((c) => (
                  <div
                    key={c.name}
                    className={cn(
                      "flex items-center gap-2 rounded-md py-1 pr-2 pl-[34px] text-[12.5px]",
                      c.on ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {c.name}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="grid place-items-center bg-muted/20 p-5">
        <div className="grid min-h-32 w-full max-w-md place-items-center rounded-md border-[1.5px] border-dashed font-mono text-xs text-muted-foreground">
          Origination · Offers · Open
        </div>
      </div>
    </div>
  )
}

/* -- module switcher ----------------------------------------------------- */

function ModuleSwitcher() {
  const [area, setArea] = React.useState("Pricing")
  return (
    <div className="flex items-center gap-3 bg-sidebar px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-6 place-items-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
          <Sprout className="size-[15px]" />
        </span>
        Kernel
      </div>
      <span className="text-border">/</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="ghost" className="gap-1.5 font-semibold">
              {area} <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          {["Pricing", "Origination", "Accounting"].map((a) => (
            <DropdownMenuItem key={a} onClick={() => setArea(a)}>
              <span className="w-3.5">{a === area ? <Check className="size-3.5" /> : null}</span>
              {a}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="ml-auto font-mono text-xs text-muted-foreground">area-scoped nav ↓</div>
    </div>
  )
}

/* -- record-level underline tabs ----------------------------------------- */

const recordTabs: { name: string; count?: string; on?: boolean }[] = [
  { name: "Overview", on: true },
  { name: "Fills", count: "3" },
  { name: "Amendments", count: "1" },
  { name: "Pricing" },
  { name: "Activity" },
]

function RecordTabs() {
  return (
    <div className="px-5 pt-4">
      <div className="text-[15px] font-semibold">Contract #C-2214</div>
      <div className="mt-3 flex items-center gap-1 overflow-x-auto">
        {recordTabs.map((t) => (
          <span
            key={t.name}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap",
              t.on ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground"
            )}
          >
            {t.name}
            {t.count && (
              <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">{t.count}</span>
            )}
          </span>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" variant="ghost" className="mb-0.5 gap-1 text-muted-foreground">
                <MoreHorizontal className="size-4" /> More
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Documents</DropdownMenuItem>
            <DropdownMenuItem>Audit log</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border-t" />
      <div className="my-4 grid min-h-20 place-items-center rounded-md border-[1.5px] border-dashed font-mono text-xs text-muted-foreground">
        tab panel
      </div>
    </div>
  )
}

export function NavPatternsSection() {
  return (
    <Section
      id="navigation"
      eyebrow="Patterns"
      title="Navigation"
      lead="A pricing tool grows areas — origination today, accounting tomorrow — so navigation has to scale by adding entries, not redesigning. Three levels, three patterns: a module switcher for areas, a grouped rail for destinations within an area, and underline tabs for views within a record."
    >
      <Subhead>Grouped rail · nested destinations</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A destination is an icon, a label, and optionally a live count. Related
        destinations sit under a group label; a destination with sub-views
        nests one level of children — never deeper. Extending the app is
        adding an entry or a group here, nothing else moves.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <GroupedRail />
      </div>

      <Subhead>Module switcher</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        When areas have separate audiences (traders price, originators book),
        a switcher next to the brand swaps the whole rail instead of growing
        it. The current area is always visible; switching is one click.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ModuleSwitcher />
      </div>

      <Subhead>Record tabs · overflow</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Views within one record are underline tabs with counts for anything
        actionable. Past five tabs, the rest live in an overflow menu —
        the strip itself never wraps or scrolls off-screen on desktop.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <RecordTabs />
      </div>
    </Section>
  )
}
