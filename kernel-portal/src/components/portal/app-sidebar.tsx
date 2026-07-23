"use client"

import { Link, useLocation } from "react-router-dom"
import {
  Sprout,
  Palette,
  Type,
  Columns3,
  Ruler,
  Layers,
  TextCursorInput,
  Table2,
  BarChart3,
  PanelsTopLeft,
  LayoutDashboard,
  Filter,
  LayoutList,
  Route,
  Terminal,
  FileText,
  Banknote,
  Handshake,
  AppWindow,
  PanelsLeftRight,
  Compass,
  SlidersHorizontal,
  ListChecks,
  Shapes,
  Sparkles,
  Gauge,
  Pencil,
  Search,
} from "@/components/ui/icon"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { galleryClusters } from "@/lib/gallery-registry"
import { MaturityPill } from "./section"

type NavItem = {
  title: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  maturity?: "experimental"
  external?: boolean
}

const nav: { label: string; items: NavItem[] }[] = [
  {
    label: "Get started",
    items: [
      { title: "Overview", to: "/", icon: Sprout },
      { title: "Install & usage", to: "/install", icon: Terminal },
      { title: "Component status", to: "/status", icon: ListChecks },
    ],
  },
  {
    label: "Foundations",
    items: [
      { title: "Color", to: "/colors", icon: Palette },
      { title: "Typography", to: "/typography", icon: Type },
      { title: "Spacing & radius", to: "/spacing", icon: Ruler },
      { title: "Layout", to: "/layout", icon: Columns3 },
      { title: "Elevation", to: "/shadows", icon: Layers },
      { title: "Motion", to: "/motion", icon: Gauge },
    ],
  },
  {
    label: "Elements",
    items: [
      { title: "Components", to: "/components", icon: Shapes },
      { title: "Form elements", to: "/forms", icon: TextCursorInput },
      { title: "Tables", to: "/tables", icon: Table2 },
      { title: "Charts", to: "/charts", icon: BarChart3 },
      { title: "Border beam", to: "/border-beam", icon: Sparkles },
    ],
  },
  {
    label: "Patterns",
    items: [
      { title: "App shell", to: "/appshell", icon: PanelsTopLeft },
      { title: "Navigation", to: "/navigation", icon: Compass },
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { title: "Filtering", to: "/filters", icon: Filter },
      { title: "Advanced filtering", to: "/filtering-advanced", icon: SlidersHorizontal },
      { title: "CRUD patterns", to: "/patterns", icon: LayoutList },
      { title: "Flows", to: "/flows", icon: Route },
      { title: "Origination flow", to: "/origination", icon: Handshake },
      { title: "Pricing worksheet", to: "/pricing", icon: Banknote },
      { title: "Modals", to: "/modals", icon: AppWindow },
      { title: "Workspace demo ↗", to: "/workspace", icon: PanelsLeftRight, maturity: "experimental", external: true },
    ],
  },
  {
    label: "Domain",
    items: [
      { title: "Contract detail", to: "/contract", icon: FileText, maturity: "experimental" },
      { title: "Settlement statement", to: "/settlement", icon: Banknote, maturity: "experimental" },
    ],
  },
  {
    label: "Objects",
    items: [
      { title: "Shell", to: "/shell", icon: AppWindow, maturity: "experimental" },
      { title: "Workspace", to: "/workspace-obj", icon: PanelsLeftRight, maturity: "experimental" },
      { title: "Collection", to: "/collection", icon: Table2, maturity: "experimental" },
      { title: "Record", to: "/record", icon: FileText, maturity: "experimental" },
      { title: "Write", to: "/write", icon: Pencil, maturity: "experimental" },
      { title: "Designs", to: "/designs", icon: LayoutDashboard, maturity: "experimental" },
      { title: "Substrate", to: "/substrate", icon: Shapes, maturity: "experimental" },
    ],
  },
  {
    label: "Aspects",
    items: [
      { title: "Query", to: "/query", icon: Search, maturity: "experimental" },
      { title: "Traversal", to: "/traversal", icon: Route, maturity: "experimental" },
    ],
  },
]

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar()
  const { pathname } = useLocation()
  const close = () => isMobile && setOpenMobile(false)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Kernel</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              design system
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {nav.slice(0, 3).map((group) => (
          <NavGroup key={group.label} group={group} pathname={pathname} onNavigate={close} />
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Component pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {galleryClusters.map((c) => (
                <SidebarMenuItem key={c.slug}>
                  <SidebarMenuButton
                    isActive={pathname === `/components/${c.slug}`}
                    render={
                      <Link to={`/components/${c.slug}`} onClick={close}>
                        <span className="flex size-4 items-center justify-center" aria-hidden>
                          <span className="size-1.5 rounded-full bg-current opacity-40" />
                        </span>
                        <span>{c.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {nav.slice(3).map((group) => (
          <NavGroup key={group.label} group={group} pathname={pathname} onNavigate={close} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 font-mono text-[11px] text-muted-foreground">
          v1.0.0 · shadcn/ui
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: (typeof nav)[number]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={!item.external && pathname === item.to}
                render={
                  <Link to={item.to} onClick={onNavigate}>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.maturity ? <MaturityPill maturity={item.maturity} /> : null}
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
