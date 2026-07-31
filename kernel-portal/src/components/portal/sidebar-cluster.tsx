"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@kernel/ui"
import { Banknote, FileText, Settings, Sprout, Truck } from "@kernel/ui/icon"

const destinations = [
  { label: "Overview", icon: Sprout, active: true },
  { label: "Open loads", icon: Truck },
  { label: "Contracts", icon: FileText },
  { label: "Settlements", icon: Banknote },
]

export function SidebarCluster() {
  return (
    <div className="relative h-[30rem] overflow-hidden rounded-lg border bg-background">
      <SidebarProvider
        defaultOpen
        className="h-full min-h-0"
        style={{ "--sidebar-width": "13rem" } as React.CSSProperties}
      >
        <Sidebar collapsible="icon" className="absolute inset-y-0 h-full">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Kernel grain operations">
                  <Sprout />
                  <span className="font-semibold">Kernel grain</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {destinations.map(({ label, icon: Icon, active }) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton isActive={active} tooltip={label}>
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Account settings">
                  <Settings />
                  <span>Account settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-w-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <span className="text-sm font-medium">Open loads</span>
          </header>
          <div className="grid flex-1 gap-3 p-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">12 loads awaiting scheduling</p>
              <p className="mt-1 text-xs text-muted-foreground">Across corn, soybeans, and wheat.</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">3 settlements need review</p>
              <p className="mt-1 text-xs text-muted-foreground">Before the next payment run.</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
