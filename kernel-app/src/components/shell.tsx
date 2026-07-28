import * as React from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  BarChart3,
  Banknote,
  ChevronsUpDown,
  FileText,
  Gauge,
  Handshake,
  LayoutDashboard,
  PanelLeft,
  Search,
  Settings,
  Sprout,
  Truck,
  Users,
} from "@/components/ui/icon"
import { cn } from "@/lib/utils"

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const primary: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Loads", to: "/loads", icon: Truck },
  { label: "Contracts", to: "/contracts", icon: FileText },
  { label: "Producers", to: "/producers", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Settlement", to: "/settlement", icon: Banknote },
  { label: "Settings", to: "/settings", icon: Settings },
]

const secondary: Item[] = [
  { label: "Support", to: "/support", icon: Handshake },
  { label: "Documentation", to: "/docs", icon: FileText },
]

function NavRow({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        "duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <item.icon className="size-[17px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function Sidebar() {
  const { pathname } = useLocation()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* brand row */}
      <div className="flex items-center gap-2 px-3 py-3">
        <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sprout className="size-[18px]" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Kernel</span>
        <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
          <button className="grid size-7 place-items-center rounded-md hover:bg-sidebar-accent/60" aria-label="Shortcuts">
            <Gauge className="size-4" />
          </button>
          <button className="grid size-7 place-items-center rounded-md hover:bg-sidebar-accent/60" aria-label="Collapse sidebar">
            <PanelLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* search */}
      <div className="px-3 pb-2">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-sidebar-border bg-background/40 px-2.5 text-[13px] text-muted-foreground">
          <Search className="size-4 shrink-0" />
          <span className="flex-1">Search…</span>
          <kbd className="rounded border border-sidebar-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
      </div>

      {/* primary nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {primary.map((it) => (
          <NavRow key={it.to} item={it} active={isActive(it.to)} />
        ))}
      </nav>

      {/* footer */}
      <div className="flex flex-col gap-0.5 px-3 py-2">
        {secondary.map((it) => (
          <NavRow key={it.to} item={it} active={isActive(it.to)} />
        ))}
      </div>
      <div className="border-t border-sidebar-border p-2.5">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-sidebar-accent/60">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground">
            RG
          </span>
          <div className="min-w-0 text-left leading-tight">
            <div className="truncate text-[13px] font-medium">Rivergrain Co.</div>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}

export function Shell() {
  return (
    <div className="flex h-full min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
