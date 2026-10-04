import { NavLink, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BarChart3, Layers, Moon, Sun } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useTheme } from "@app/lib/theme"

const NAV = [
  { to: "/", label: "Draw areas", icon: Layers, end: true },
  { to: "/tonnage", label: "Crop tonnage", icon: BarChart3, end: false },
]

export function Shell() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-sm font-semibold">Origination map</span>
          <span className="hidden text-xs text-muted-foreground md:inline">Prototype · public sources</span>
        </div>
        <nav aria-label="Views" className="ml-auto flex items-center gap-1 overflow-x-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-(--control-h-sm) items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-sm whitespace-nowrap transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  isActive ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground",
                )
              }
            >
              <Icon className="size-4" />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </NavLink>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
