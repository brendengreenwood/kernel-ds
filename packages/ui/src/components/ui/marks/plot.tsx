import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Plot — a small filled glyph representing one datum on a plot, scatter,
 * or spatial view. Purely presentational — inherits `currentColor` for
 * fill, sized by the `size` variant, shape by the `shape` variant.
 * Positioning is caller-owned; use `style` or a positioning parent.
 *
 * Marks like this are decorative by default (`aria-hidden`). If a Plot
 * carries meaning on its own (e.g. the only representation of a value),
 * the caller must add semantic context.
 */
const plotVariants = cva(
  "inline-block text-current [&_svg]:block [&_svg]:size-full",
  {
    variants: {
      shape: {
        dot: "",
        square: "",
        triangle: "",
        diamond: "",
      },
      size: {
        sm: "size-1.5",
        default: "size-2",
        lg: "size-3",
      },
    },
    defaultVariants: { shape: "dot", size: "default" },
  }
)

function glyph(shape: "dot" | "square" | "triangle" | "diamond") {
  switch (shape) {
    case "square":
      return <rect x="1" y="1" width="14" height="14" fill="currentColor" />
    case "triangle":
      return <polygon points="8,1 15,15 1,15" fill="currentColor" />
    case "diamond":
      return <polygon points="8,1 15,8 8,15 1,8" fill="currentColor" />
    case "dot":
    default:
      return <circle cx="8" cy="8" r="6.5" fill="currentColor" />
  }
}

function Plot({
  className,
  shape,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof plotVariants>) {
  const s = shape ?? "dot"
  return (
    <span
      data-slot="plot"
      data-shape={s}
      aria-hidden="true"
      className={cn(plotVariants({ shape, size }), className)}
      {...props}
    >
      <svg viewBox="0 0 16 16">{glyph(s)}</svg>
    </span>
  )
}

export { Plot, plotVariants }
export type PlotVariants = VariantProps<typeof plotVariants>
