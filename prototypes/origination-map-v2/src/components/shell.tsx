import * as React from "react"
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BarChart3, Home, Layers, LayoutList, Route, Moon, PanelLeftIcon, Sun, User, Users } from "@/components/ui/icon"
import { useTheme } from "@app/lib/theme"
import { PERSONAS, personaLabel, usePersona, type Persona } from "@app/lib/persona"

// One tile style for both states: 48px tall, 24px icon pinned 12px in, so
// collapsing only narrows the sidebar and the label fades — nothing reflows.
const RAIL =
  "h-12! w-full! gap-3 rounded-[var(--radius-surface)] p-3! whitespace-nowrap text-sidebar-foreground dark:text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:not-data-active:bg-sidebar-accent/50 dark:hover:not-data-active:bg-sidebar-accent data-active:border data-active:border-sidebar-border dark:data-active:border-border data-active:text-sidebar-accent-foreground data-active:shadow-sm dark:data-active:text-brand-100 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-12! group-data-[collapsible=icon]:p-3! data-active:p-[11px]! group-data-[collapsible=icon]:data-active:p-[11px]! [&_svg]:size-6! [&>span]:transition-opacity [&>span]:duration-[var(--duration-base)] [&>span]:ease-[var(--ease-out)] group-data-[collapsible=icon]:[&>span]:opacity-0"

// roles: who sees the item. Omitted = every persona.
const NAV: { to: string; label: string; icon: typeof Home; roles?: Persona[] }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/scenarios", label: "Scenarios", icon: LayoutList, roles: ["merchant"] },
  { to: "/producers", label: "Producers", icon: Users },
  { to: "/map", label: "Draw areas", icon: Layers },
  { to: "/tonnage", label: "Crop tonnage", icon: BarChart3 },
  { to: "/model", label: "Data model", icon: Route },
]

export function Shell() {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const dark = theme === "dark"
  const { persona } = usePersona()
  const nav = NAV.filter((n) => !n.roles || n.roles.includes(persona))
  const blocked = NAV.find((n) => n.roles && !n.roles.includes(persona) && pathname.startsWith(n.to))
  if (blocked) return <Navigate to="/home" replace />
  return (
    <SidebarProvider
      defaultOpen={false}
      className="h-dvh min-h-0"
      style={{ "--sidebar-width-icon": "3rem" } as React.CSSProperties}
    >
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="px-0">
          <div className="flex h-12 items-center gap-3 overflow-hidden px-1.5">
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              className="ml-0.5 size-8 shrink-0 text-sidebar-primary"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M32 15.4121C31.8889 6.67004 24.7986 0 16.0311 0C7.17721 0 0 7.16566 0 16.0066C0 24.8349 7.17661 32 16.0311 32C24.7986 32 31.8889 25.3294 32 16.5873C30.4707 16.5873 24.8617 16.5982 20.04 20.5369C15.2311 24.4653 14.2659 25.3391 10.6033 25.3391C5.43617 25.3391 1.33702 21.1659 1.33702 16.0066C1.33702 10.8474 5.43617 6.66089 10.6033 6.66089C14.2653 6.66089 15.2305 7.53534 20.04 11.4625C24.8617 15.4024 30.4713 15.4121 32 15.4121Z"
              />
            </svg>
            <div className="min-w-0 whitespace-nowrap transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)] group-data-[collapsible=icon]:opacity-0">
              <div className="truncate text-sm font-semibold">Origination map</div>
              <div className="truncate text-xs text-sidebar-foreground/70">Prototype · public sources</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {nav.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      render={<NavLink to={to} />}
                      isActive={pathname === to || pathname.startsWith(to + "/")}
                      tooltip={label}
                      className={RAIL}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-0">
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <PersonaSwitcher />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapseButton />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={RAIL}
                tooltip={dark ? "Light theme" : "Dark theme"}
                onClick={() => setTheme(dark ? "light" : "dark")}
              >
                {dark ? <Sun /> : <Moon />}
                <span>{dark ? "Light theme" : "Dark theme"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 md:peer-data-[variant=inset]:ml-0 dark:bg-card">
        <SidebarTrigger className="absolute top-3 left-3 z-30 bg-card/95 dark:bg-neutral-700/90 dark:border-neutral-600 shadow-lg backdrop-blur md:hidden" variant="outline" />
        <div key={pathname.split("/")[1]} className="min-h-0 flex-1 animate-in fade-in duration-[var(--duration-base)] ease-[var(--ease-out)] motion-reduce:animate-none">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Prototype tool: stands in for signing in as another role.
function PersonaSwitcher() {
  const { persona, setPersona } = usePersona()
  const label = personaLabel(persona)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton className={RAIL} tooltip={`Persona: ${label}`} />}>
        <User />
        <span>{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>View as (prototype)</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={persona} onValueChange={(v) => setPersona(v as Persona)}>
            {PERSONAS.map((p) => (
              <DropdownMenuRadioItem key={p.id} value={p.id}>
                {p.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CollapseButton() {
  const { open, toggleSidebar } = useSidebar()
  const label = open ? "Collapse sidebar" : "Expand sidebar"
  return (
    <SidebarMenuButton className={RAIL} tooltip={label} onClick={toggleSidebar}>
      <PanelLeftIcon />
      <span>{label}</span>
    </SidebarMenuButton>
  )
}
