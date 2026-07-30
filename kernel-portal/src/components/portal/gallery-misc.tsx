"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronsUpDown, Calendar as CalendarIcon, FileText, Truck } from "@kernel/ui/icon"

import { cn } from "@kernel/ui/utils"
import { Button } from "@kernel/ui"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kernel/ui"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@kernel/ui"
import { Calendar } from "@kernel/ui"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kernel/ui"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@kernel/ui"
import { ScrollArea } from "@kernel/ui"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@kernel/ui"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@kernel/ui"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@kernel/ui"
import { Kbd, KbdGroup } from "@kernel/ui"
import { Demo } from "./section"
import type { GalleryCluster } from "@/lib/gallery-types"

function DatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 12))
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("w-[260px] justify-start gap-2 font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
      </PopoverContent>
    </Popover>
  )
}

const releases = [
  "v1.2.0 — token refinements",
  "v1.1.4 — dark mode contrast",
  "v1.1.0 — chart palette",
  "v1.0.6 — sheet + drawer",
  "v1.0.2 — calendar",
  "v1.0.0 — initial release",
  "v0.9.0 — beta",
  "v0.8.0 — alpha",
]

function AccordionCluster() {
  const [open, setOpen] = React.useState(true)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Accordion defaultValue={["a1"]} className="rounded-lg border bg-card px-4">
          <AccordionItem value="a1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. Every component follows WAI-ARIA patterns and is keyboard navigable.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a2">
            <AccordionTrigger>Is it themed?</AccordionTrigger>
            <AccordionContent>
              Yes. All styling derives from the Kernel token set in light and dark.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes, with a default that honors reduced-motion preferences.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Demo className="items-start">
          <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5">
              <span className="text-sm font-medium">@kernel starred 3 repos</span>
              <CollapsibleTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-7">
                    <ChevronsUpDown />
                  </Button>
                }
              />
            </div>
            <CollapsibleContent className="space-y-2">
              {["@kernel/ui", "@kernel/themes", "@kernel/charts"].map((r) => (
                <div key={r} className="rounded-md border bg-card px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {r}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </Demo>
      </div>
    </>
  )
}

function CalendarCluster() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 7))

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo className="justify-center">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border bg-card" />
        </Demo>
        <Demo className="items-start">
          <DatePicker />
        </Demo>
      </div>
    </>
  )
}

function CarouselCluster() {
  return (
    <>
      <Demo className="justify-center">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <CarouselItem key={n} className="basis-1/3">
                <div className="grid aspect-square place-items-center rounded-lg border bg-primary/10 text-4xl font-semibold text-primary">
                  {n}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Demo>
    </>
  )
}

function ScrollAreaCluster() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo className="justify-center">
          <ScrollArea className="h-44 w-full max-w-xs rounded-md border bg-card p-2">
            {releases.map((r) => (
              <div key={r} className="border-b px-3 py-2 text-sm last:border-b-0">
                {r}
              </div>
            ))}
          </ScrollArea>
        </Demo>
        <Demo className="justify-center">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-40 max-w-md rounded-lg border"
          >
            <ResizablePanel defaultSize={35}>
              <div className="grid h-full place-items-center p-4 text-sm text-muted-foreground">
                Sidebar
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65}>
              <div className="grid h-full place-items-center p-4 text-sm text-muted-foreground">
                Content
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Demo>
      </div>
    </>
  )
}

function EmptyCluster() {
  return (
    <>
      <Demo className="justify-center">
        <Empty className="max-w-sm border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No open contracts</EmptyTitle>
            <EmptyDescription>
              Contracts you draft with a counterparty show up here until they settle.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Draft a contract</Button>
          </EmptyContent>
        </Empty>
      </Demo>
    </>
  )
}

const loads = [
  { id: "LD-4471", farm: "Vance Farms", detail: "1,200 bu corn · scaled 08:14" },
  { id: "LD-4472", farm: "Prairie Ridge", detail: "980 bu soybeans · in transit" },
  { id: "LD-4473", farm: "Halloway Acres", detail: "1,450 bu corn · awaiting probe" },
]

function ItemCluster() {
  return (
    <>
      <Demo>
        <ItemGroup className="max-w-md">
          {loads.map((load) => (
            <Item key={load.id} variant="outline">
              <ItemMedia variant="icon">
                <Truck />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {load.id} · {load.farm}
                </ItemTitle>
                <ItemDescription>{load.detail}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </Demo>
    </>
  )
}

function KbdCluster() {
  return (
    <>
      <Demo className="justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <p>
            Press{" "}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{" "}
            to open the command palette.
          </p>
          <p>
            Press <Kbd>Esc</Kbd> to dismiss it.
          </p>
        </div>
      </Demo>
    </>
  )
}

export const miscClusters: GalleryCluster[] = [
  { anchor: "c-accordion", slug: "accordion", title: "Accordion · Collapsible", group: "Disclosure", demo: AccordionCluster },
  { anchor: "c-calendar", slug: "calendar", title: "Calendar · Date picker", group: "Date & media", demo: CalendarCluster },
  { anchor: "c-carousel", slug: "carousel", title: "Carousel", group: "Date & media", demo: CarouselCluster },
  { anchor: "c-empty", slug: "empty", title: "Empty", group: "Feedback & overlay", demo: EmptyCluster },
  { anchor: "c-scroll-area", slug: "scroll-area", title: "Scroll area · Resizable", group: "Layout", demo: ScrollAreaCluster },
  { anchor: "c-item", slug: "item", title: "Item", group: "Layout", demo: ItemCluster },
  { anchor: "c-kbd", slug: "kbd", title: "Kbd", group: "Layout", demo: KbdCluster },
]
