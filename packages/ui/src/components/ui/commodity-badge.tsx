import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CommodityBadge — a scannable tag for a grain commodity.
 *
 * A categorical system (decision 0013), distinct from `<StatusBadge>`
 * (lifecycle state) and notification `<Badge>` variants (event outcome):
 * each commodity owns a `--commodity-*` hue so a column of tags reads at a
 * glance. Same soft-fill + leading-dot anatomy as StatusBadge.
 *
 *   <CommodityBadge commodity="corn" />
 *   <CommodityBadge commodity="soybeans">Soybeans · #2</CommodityBadge>
 */
const commodityBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border py-0.5 pl-2 pr-2.5 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      commodity: {
        corn:
          "border-commodity-corn-200 bg-commodity-corn-100 text-commodity-corn-900 dark:border-commodity-corn-800/50 dark:bg-commodity-corn-900/45 dark:text-commodity-corn-100",
        canola:
          "border-commodity-canola-200 bg-commodity-canola-100 text-commodity-canola-900 dark:border-commodity-canola-800/50 dark:bg-commodity-canola-900/45 dark:text-commodity-canola-100",
        soybeans:
          "border-commodity-soy-200 bg-commodity-soy-100 text-commodity-soy-900 dark:border-commodity-soy-800/50 dark:bg-commodity-soy-900/45 dark:text-commodity-soy-100",
        wheat:
          "border-commodity-wheat-200 bg-commodity-wheat-100 text-commodity-wheat-900 dark:border-commodity-wheat-800/50 dark:bg-commodity-wheat-900/45 dark:text-commodity-wheat-100",
      },
    },
    defaultVariants: { commodity: "corn" },
  }
)

export type Commodity = NonNullable<
  VariantProps<typeof commodityBadgeVariants>["commodity"]
>

const dotColor: Record<Commodity, string> = {
  corn: "bg-commodity-corn-500",
  canola: "bg-commodity-canola-500",
  soybeans: "bg-commodity-soy-500",
  wheat: "bg-commodity-wheat-500",
}

const defaultLabel: Record<Commodity, string> = {
  corn: "Corn",
  canola: "Canola",
  soybeans: "Soybeans",
  wheat: "Wheat",
}

function CommodityBadge({
  commodity = "corn",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof commodityBadgeVariants>) {
  const key = (commodity ?? "corn") as Commodity
  return (
    <span
      data-slot="commodity-badge"
      data-commodity={key}
      className={cn(commodityBadgeVariants({ commodity }), className)}
      {...props}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotColor[key])} />
      {children ?? defaultLabel[key]}
    </span>
  )
}

/**
 * CommodityLabel — the quiet form: a commodity-colored dot + the name, no
 * pill. For dense table cells where a full badge would compete with the
 * StatusBadge already in the row (decision 0013). Same hue vocabulary.
 *
 *   <CommodityLabel commodity="soybeans" />
 */
function CommodityLabel({
  commodity = "corn",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof commodityBadgeVariants>) {
  const key = (commodity ?? "corn") as Commodity
  return (
    <span
      data-slot="commodity-label"
      data-commodity={key}
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}
      {...props}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotColor[key])} />
      {children ?? defaultLabel[key]}
    </span>
  )
}

/** Map a free-text grain label ("Soybean", "soy") to its Commodity key. */
function commodityFromLabel(s: string): Commodity {
  const k = s.trim().toLowerCase()
  if (k.startsWith("canola")) return "canola"
  if (k.startsWith("soy")) return "soybeans"
  if (k.startsWith("wheat")) return "wheat"
  return "corn"
}

export {
  CommodityBadge,
  CommodityLabel,
  commodityBadgeVariants,
  commodityFromLabel,
}
