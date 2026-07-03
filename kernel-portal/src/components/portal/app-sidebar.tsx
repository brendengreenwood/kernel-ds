"use client"

import * as React from "react"
import {
  Sprout,
  Palette,
  Type,
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
  Receipt,
  ListChecks,
} from "lucide-react"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { components } from "@/lib/component-meta"
import { MaturityPill } from "./section"

const nav = [
  {
    label: "Get started",
    items: [
      { title: "Overview", href: "#overview", icon: Sprout },
      { title: "Install & usage", href: "#install", icon: Terminal },
      { title: "Component status", href: "#status", icon: ListChecks },
    ],
  },
  {
    label: "Foundations",
    items: [
      { title: "Color", href: "#colors", icon: Palette },
      { title: "Typography", href: "#typography", icon: Type },
      { title: "Spacing & radius", href: "#spacing", icon: Ruler },
      { title: "Elevation", href: "#shadows", icon: Layers },
    ],
  },
  {
    label: "Elements",
    items: [
      { title: "Form elements", href: "#forms", icon: TextCursorInput },
      { title: "Tables", href: "#tables", icon: Table2 },
      { title: "Charts", href: "#charts", icon: BarChart3 },
    ],
  },
  {
    label: "Patterns",
    items: [
      { title: "App shell", href: "#appshell", icon: PanelsTopLeft },
      { title: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
      { title: "Filtering", href: "#filters", icon: Filter },
      { title: "CRUD patterns", href: "#patterns", icon: LayoutList },
      { title: "Flows", href: "#flows", icon: Route },
    ],
  },
  {
    label: "Domain",
    items: [
      { title: "Contract detail", href: "#contract", icon: FileText, maturity: "experimental" as const },
      { title: "Settlement statement", href: "#settlement", icon: Receipt, maturity: "experimental" as const },
    ],
  },
]

export function AppSidebar() {
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
        {nav.slice(0, 2).map((group) => (
          <NavGroup key={group.label} group={group} />
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub className="mr-0 border-l-0 px-0">
                  {components.map((c) => (
                    <SidebarMenuSubItem key={c.name}>
                      <SidebarMenuSubButton
                        size="sm"
                        render={
                          <a href={`#${c.anchor}`}>
                            <span className="truncate">{c.name}</span>
                            <MaturityPill maturity={c.maturity} />
                          </a>
                        }
                      />
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {nav.slice(2).map((group) => (
          <NavGroup key={group.label} group={group} />
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

function NavGroup({ group }: { group: (typeof nav)[number] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                    {"maturity" in item && item.maturity ? (
                      <MaturityPill maturity={item.maturity} />
                    ) : null}
                  </a>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
