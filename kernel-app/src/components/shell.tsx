import * as React from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  ChevronsUpDown,
  FileText,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  Sprout,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ModeToggle } from "@/components/mode-toggle"

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const primary: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Scenarios", to: "/scenarios", icon: ListChecks },
  { label: "Producers", to: "/producers", icon: Users },
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
            tooltip={it.label}
            // Collapsed, the DS squares the button to size-8 with p-2, leaving
            // 4 units of content box — so the roomier size-5 glyph steps back
            // to size-4 rather than spilling out of it.
            className="h-10 gap-3 text-base [&_svg]:size-5 group-data-[collapsible=icon]:[&_svg]:size-4"
            render={
              <Link to={it.to} onClick={() => isMobile && setOpenMobile(false)}>
                <it.icon />
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
    <Sidebar variant="inset" collapsible="icon">
      {/* Beside the sidebar, the rail's first row shares a band with the page
          title: the page content is inset md:pt-8 from the panel top, so the
          header takes the matching top inset (its own p-2 plus the logo row's
          py-1 make up the rest). Below md the sidebar is offcanvas, so there is
          nothing to align to and the DS default stands. */}
      <SidebarHeader className="gap-2 md:pt-6">
        {/* Collapsed the rail is 3rem — one slot wide. The brand and theme
            toggle stand down and the trigger takes the slot, so the way back
            out is always visible (Cmd/Ctrl+B and the rail edge also work). */}
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
            <Sprout className="size-[18px]" />
          </span>
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Kernel
          </span>
          <div className="ml-auto group-data-[collapsible=icon]:hidden">
            <ModeToggle />
          </div>
          <SidebarTrigger className="text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:ml-0" />
        </div>
        <div className="relative px-1 group-data-[collapsible=icon]:hidden">
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
        <button
          title="Rivergrain Co."
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-sidebar-accent/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground">
              RG
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium group-data-[collapsible=icon]:hidden">
            Rivergrain Co.
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
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
    <TooltipProvider>
      <SidebarProvider>
        <ScrollTop />
        <AppSidebar />
        <SidebarInset className="bg-background">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
