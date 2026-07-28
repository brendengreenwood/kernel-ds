import * as React from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  BarChart3,
  Banknote,
  ChevronsUpDown,
  FileText,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  Sprout,
  Truck,
  Users,
} from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const primary: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Loads", to: "/loads", icon: Truck },
  { label: "Contracts", to: "/contracts", icon: FileText },
  { label: "Scenarios", to: "/scenarios", icon: ListChecks },
  { label: "Producers", to: "/producers", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Settlement", to: "/settlement", icon: Banknote },
  { label: "Settings", to: "/settings", icon: Settings },
]

const secondary: Item[] = [
  { label: "Support", to: "/support", icon: Handshake },
  { label: "Documentation", to: "/docs", icon: FileText },
]

function Nav({ items }: { items: Item[] }) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))
  return (
    <SidebarMenu>
      {items.map((it) => (
        <SidebarMenuItem key={it.to}>
          <SidebarMenuButton
            isActive={isActive(it.to)}
            render={
              <Link to={it.to} onClick={() => isMobile && setOpenMobile(false)}>
                <it.icon className="size-[17px]" />
                <span>{it.label}</span>
              </Link>
            }
          />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="gap-2">
        <div className="flex items-center gap-2 px-1 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="size-[18px]" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Kernel</span>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
        <div className="relative px-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="h-9 border-sidebar-border bg-background/40 pl-9 text-[13px]"
            aria-label="Search"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Nav items={primary} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroupContent>
          <Nav items={secondary} />
        </SidebarGroupContent>
        <button className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-sidebar-accent/60">
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground">
              RG
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">Rivergrain Co.</span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

/** Jump to top on navigation. */
function ScrollTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export function Shell() {
  return (
    <SidebarProvider>
      <ScrollTop />
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
