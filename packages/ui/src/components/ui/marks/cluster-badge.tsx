import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ClusterBadge — a small pill that stands in for N stacked/overlapping
 * items on a spatial surface. Renders "+{count}" by default. Uses
 * inherited `currentColor` for its text; the caller decides the fill
 * via variant or `className`.
 *
 * `count: 0` renders nothing (the mark exists to signal a cluster).
 */
const clusterBadgeVariants = cva(
  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none tabular-nums ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground ring-primary/40",
        muted: "bg-muted text-muted-foreground ring-border",
      },
      size: {
        sm: "h-4 min-w-4 px-1 text-[9px]",
        default: "h-5 min-w-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ClusterBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof clusterBadgeVariants> & { count: number }

function ClusterBadge({
  className,
  variant,
  size,
  count,
  ...props
}: ClusterBadgeProps) {
  if (!Number.isFinite(count) || count <= 0) return null
  return (
    <span
      data-slot="cluster-badge"
      data-count={count}
      role="img"
      aria-label={`${count} more`}
      className={cn(clusterBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {`+${count}`}
    </span>
  )
}

export { ClusterBadge, clusterBadgeVariants }
export type ClusterBadgeVariants = VariantProps<typeof clusterBadgeVariants>
