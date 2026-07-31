"use client"

import * as React from "react"
import {
  User,
  Settings,
  LogOut,
  Copy,
  Share,
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
  Clock,
  Truck,
  FileText,
  Banknote,
  Sprout,
  AlertTriangle,
} from "@kernel/ui/icon"

import { cn } from "@kernel/ui/utils"
import { typeStyles } from "@/lib/type-styles"
import { Button } from "@kernel/ui"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabCount,
  TabDot,
} from "@kernel/ui"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@kernel/ui"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@kernel/ui"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@kernel/ui"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@kernel/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@kernel/ui"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@kernel/ui"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@kernel/ui"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kernel/ui"
import { Demo } from "./section"
import { SidebarCluster } from "./sidebar-cluster"
import type { GalleryCluster } from "@/lib/gallery-types"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
]

function FrameworkPicker() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("next")
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-[220px] justify-between">
            {frameworks.find((f) => f.value === value)?.label ?? "Select…"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search framework…" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((f) => (
                <CommandItem
                  key={f.value}
                  value={f.value}
                  onSelect={(v) => {
                    setValue(v)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === f.value ? "opacity-100" : "opacity-0")} />
                  {f.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function GrainTabs({
  variant,
  size,
  notify = "dot",
}: {
  variant?: "pill" | "underline" | "folder"
  size?: "compact" | "default" | "comfortable"
  notify?: "dot" | "icon"
}) {
  return (
    <Tabs defaultValue="loads" className="w-full">
      {/* atomic-width row → scroll in place on narrow viewports (no page overflow) */}
      <div className="max-w-full overflow-x-auto pb-px">
      <TabsList variant={variant} size={size}>
        <TabsTrigger value="loads">
          <Truck /> Open loads <TabCount>12</TabCount>
        </TabsTrigger>
        <TabsTrigger value="contracts">
          <FileText /> Contracts <TabCount>128</TabCount>
        </TabsTrigger>
        <TabsTrigger value="settle">
          <Banknote /> Settlements <TabCount>3</TabCount>
          {notify === "dot" ? (
            <TabDot />
          ) : (
            <AlertTriangle className="size-3.5 text-[var(--warning-600)]" />
          )}
        </TabsTrigger>
        <TabsTrigger value="farms">
          <Sprout /> Farms
        </TabsTrigger>
      </TabsList>
      </div>
      <TabsContent value="loads" className="text-sm text-muted-foreground">
        12 open loads awaiting scheduling.
      </TabsContent>
      <TabsContent value="contracts" className="text-sm text-muted-foreground">
        128 active contracts across corn, soybeans, and wheat.
      </TabsContent>
      <TabsContent value="settle" className="text-sm text-muted-foreground">
        3 settlements need review before payment runs.
      </TabsContent>
      <TabsContent value="farms" className="text-sm text-muted-foreground">
        Producer and farm directory.
      </TabsContent>
    </Tabs>
  )
}

function Labeled({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Demo className="block">
      <p className={cn("mb-4", typeStyles.overline)}>
        {label}
      </p>
      {children}
    </Demo>
  )
}

function TabsCluster() {
  return (
    <div className="space-y-6">
      <Labeled label="Pill · primary active (default) — leading icon · count badge · notification dot">
        <GrainTabs variant="pill" />
      </Labeled>
      <Labeled label="Underline">
        <GrainTabs variant="underline" />
      </Labeled>
      <Labeled label="Folder — with a trailing notification icon">
        <GrainTabs variant="folder" notify="icon" />
      </Labeled>
      <Labeled label="Sizes — compact · default · comfortable (control-height tokens)">
        <div className="space-y-5">
          <GrainTabs variant="pill" size="compact" />
          <GrainTabs variant="pill" size="default" />
          <GrainTabs variant="pill" size="comfortable" />
        </div>
      </Labeled>
    </div>
  )
}

function BreadcrumbCluster() {
  return (
    <>
      <Demo className="flex-col items-start gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Components</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination className="mx-0 w-auto justify-start">
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Demo>
    </>
  )
}

function NavigationMenuCluster() {
  return (
    <>
      <Demo className="flex-col items-start gap-6">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 p-3 md:grid-cols-2">
                  {[
                    ["Components", "45 accessible building blocks."],
                    ["Theming", "Tokenized color, fully re-skinnable."],
                    ["Charts", "Composable data visualization."],
                    ["CLI", "Add components with one command."],
                  ].map(([t, d]) => (
                    <li key={t}>
                      <NavigationMenuLink className="block rounded-md p-3 hover:bg-muted">
                        <div className="text-sm font-semibold">{t}</div>
                        <div className="text-xs text-muted-foreground">{d}</div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New tab</MenubarItem>
              <MenubarItem>New window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger></MenubarMenu>
          <MenubarMenu><MenubarTrigger>View</MenubarTrigger></MenubarMenu>
        </Menubar>
      </Demo>
    </>
  )
}

function DropdownMenuCluster() {
  return (
    <>
      <Demo className="gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Open menu</Button>} />
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>⌘P</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive"><LogOut /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ContextMenu>
          <ContextMenuTrigger className="grid h-20 w-56 place-items-center rounded-md border border-dashed text-sm text-muted-foreground">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem><Copy /> Copy</ContextMenuItem>
            <ContextMenuItem><Share /> Share</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Refresh</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Demo>
    </>
  )
}

function CommandCluster() {
  return (
    <>
      <Demo className="flex-col items-start gap-6">
        <Command className="max-w-md rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem><CalendarIcon /> Calendar</CommandItem>
              <CommandItem><Clock /> Search history</CommandItem>
              <CommandItem><User /> Profile</CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
        <FrameworkPicker />
      </Demo>
    </>
  )
}

export const navClusters: GalleryCluster[] = [
  { anchor: "c-sidebar", slug: "sidebar", title: "Sidebar", group: "Navigation", demo: SidebarCluster },
  { anchor: "c-tabs", slug: "tabs", title: "Tabs", group: "Navigation", demo: TabsCluster },
  { anchor: "c-breadcrumb", slug: "breadcrumb", title: "Breadcrumb · Pagination", group: "Navigation", demo: BreadcrumbCluster },
  { anchor: "c-navigation-menu", slug: "navigation-menu", title: "Navigation menu · Menubar", group: "Navigation", demo: NavigationMenuCluster },
  { anchor: "c-dropdown-menu", slug: "dropdown-menu", title: "Dropdown menu · Context menu", group: "Menus & command", demo: DropdownMenuCluster },
  { anchor: "c-command", slug: "command", title: "Command", group: "Menus & command", demo: CommandCluster },
]
