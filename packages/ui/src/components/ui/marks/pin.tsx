import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Pin — a positioned marker for a single record on a spatial surface
 * (map, canvas, timeline). Anatomy is a filled circle head with an
 * optional tail; positioning is caller-owned (parent supplies `style`
 * with `left`/`top` or wraps in a positioning container). The component
 * itself does not consume `x`/`y` — that keeps `Pin` substrate-agnostic
 * (see decision 0027).
 *
 * Semantics:
 * - When interactive (a callable action), give it `role="button"` and
 *   an `aria-label`. Callers pass these through as native props.
 * - When purely decorative (a static count or a legend), leave it
 *   presentational — `aria-hidden` may be set by the caller.
 */
const pinVariants = cva(
  "relative inline-flex items-center justify-center text-current [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        destructive: "text-destructive",
      },
      size: {
        sm: "size-3",
        default: "size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Pin({
  className,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & VariantProps<typeof pinVariants>) {
  return (
    <span
      data-slot="pin"
      data-variant={variant ?? "default"}
      className={cn(pinVariants({ variant, size }), className)}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="size-full drop-shadow-sm"
      >
        <path d="M8 1.5c-2.485 0-4.5 2.015-4.5 4.5 0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5zM8 7.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5z" />
      </svg>
    </span>
  )
}

export { Pin, pinVariants }
export type PinVariants = VariantProps<typeof pinVariants>
