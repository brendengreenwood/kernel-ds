import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-3 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit text-muted-foreground group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch",
  {
    variants: {
      // pill = segmented container, primary as the active fill (default)
      // underline = transparent, primary underline indicator
      // folder = file-folder tabs that lift onto the panel
      variant: {
        pill: "items-center gap-1 rounded-full border border-border bg-muted p-[5px]",
        underline: "items-end gap-1 rounded-none border-b border-border",
        folder: "items-end gap-1 rounded-none border-b border-border",
      },
      size: {
        compact: "",
        default: "",
        comfortable: "",
      },
    },
    defaultVariants: {
      variant: "pill",
      size: "default",
    },
  }
)

function TabsList({
  className,
  variant = "pill",
  size = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // shared
        "group/tab relative inline-flex items-center justify-center whitespace-nowrap font-medium text-muted-foreground transition-all outline-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // size (height / padding / text / inner gap) — mirrors the control-height tokens
        "group-data-[size=compact]/tabs-list:h-[var(--control-h-sm)] group-data-[size=compact]/tabs-list:gap-1.5 group-data-[size=compact]/tabs-list:px-2 group-data-[size=compact]/tabs-list:text-xs",
        "group-data-[size=default]/tabs-list:h-[var(--control-h)] group-data-[size=default]/tabs-list:gap-2 group-data-[size=default]/tabs-list:px-2.5 group-data-[size=default]/tabs-list:text-sm",
        "group-data-[size=comfortable]/tabs-list:h-[var(--control-h-lg)] group-data-[size=comfortable]/tabs-list:gap-2 group-data-[size=comfortable]/tabs-list:px-3.5 group-data-[size=comfortable]/tabs-list:text-sm",
        // pill
        "group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:hover:text-foreground group-data-[variant=pill]/tabs-list:data-active:bg-primary group-data-[variant=pill]/tabs-list:data-active:text-primary-foreground group-data-[variant=pill]/tabs-list:data-active:shadow-sm",
        // underline
        "group-data-[variant=underline]/tabs-list:-mb-px group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:hover:text-foreground group-data-[variant=underline]/tabs-list:data-active:border-primary group-data-[variant=underline]/tabs-list:data-active:text-foreground",
        // folder — active tab's bottom edge is card-colored so it punches
        // through the list's baseline and reads as connected to the panel
        "group-data-[variant=folder]/tabs-list:-mb-px group-data-[variant=folder]/tabs-list:rounded-t-md group-data-[variant=folder]/tabs-list:border group-data-[variant=folder]/tabs-list:border-transparent group-data-[variant=folder]/tabs-list:hover:bg-muted/60 group-data-[variant=folder]/tabs-list:hover:text-foreground group-data-[variant=folder]/tabs-list:data-active:relative group-data-[variant=folder]/tabs-list:data-active:z-10 group-data-[variant=folder]/tabs-list:data-active:bg-card group-data-[variant=folder]/tabs-list:data-active:border-border group-data-[variant=folder]/tabs-list:data-active:border-b-card group-data-[variant=folder]/tabs-list:data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Trailing count badge — inverts with the tab's current color, so it reads on
 *  an inactive tab and on a filled active pill alike. */
function TabCount({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tab-count"
      className={cn(
        "inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-current/15 px-1 text-[11px] font-semibold leading-none tabular-nums",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/** Notification indicator — a small dot (defaults to the destructive tone). */
function TabDot({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tab-dot"
      aria-hidden="true"
      className={cn("size-1.5 rounded-full bg-destructive", className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabCount,
  TabDot,
  tabsListVariants,
}
