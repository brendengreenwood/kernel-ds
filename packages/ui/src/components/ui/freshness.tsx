import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Clock } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Freshness — whether a piece of market data is still inside its stale limit.
 *
 * Distinct from <StatusBadge>, which is a lifecycle state the object sits in.
 * Freshness is a condition derived from a date: a published scenario stays
 * published while its Posted Bid Date goes stale underneath it. So it renders
 * as quiet inline text beside the value it qualifies, never as a pill.
 *
 * The component only shows the verdict. Counting business days against the
 * band limit is the caller's job — the trading calendar is not a UI concern.
 *
 *   <Freshness state="stale" />
 *   <Freshness state="stale">Stale · 4 business days</Freshness>
 */
const freshnessVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium leading-none whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      state: {
        fresh: "text-muted-foreground",
        stale: "text-warning-800 dark:text-warning-200",
      },
    },
    defaultVariants: { state: "fresh" },
  }
)

export type FreshnessState = NonNullable<
  VariantProps<typeof freshnessVariants>["state"]
>

const defaultLabel: Record<FreshnessState, string> = {
  fresh: "Fresh",
  stale: "Stale",
}

function Freshness({
  state = "fresh",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof freshnessVariants>) {
  const key = (state ?? "fresh") as FreshnessState
  return (
    <span
      data-slot="freshness"
      data-state={key}
      className={cn(freshnessVariants({ state }), className)}
      {...props}
    >
      <Clock aria-hidden="true" />
      {children ?? defaultLabel[key]}
    </span>
  )
}

export { Freshness, freshnessVariants }
