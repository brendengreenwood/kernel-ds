import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * LegendSwatch — a small color-key glyph for a legend row. The color
 * comes from the caller via `style={{ background: "…" }}` or a
 * background utility class (`bg-primary`, `bg-commodity-corn-500`, …).
 * The swatch itself does not embed a color choice — it stays a shape.
 *
 * Presentational by default (`aria-hidden`); the visible legend row
 * label supplies the meaning next to it.
 */
const legendSwatchVariants = cva(
  "inline-block shrink-0 bg-current",
  {
    variants: {
      shape: {
        square: "rounded-[2px]",
        circle: "rounded-full",
        line: "rounded-full",
      },
      size: {
        sm: "",
        default: "",
      },
    },
    compoundVariants: [
      { shape: "square", size: "sm", class: "size-2" },
      { shape: "square", size: "default", class: "size-2.5" },
      { shape: "circle", size: "sm", class: "size-2" },
      { shape: "circle", size: "default", class: "size-2.5" },
      { shape: "line", size: "sm", class: "h-0.5 w-3" },
      { shape: "line", size: "default", class: "h-0.5 w-4" },
    ],
    defaultVariants: { shape: "square", size: "default" },
  }
)

function LegendSwatch({
  className,
  shape,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof legendSwatchVariants>) {
  return (
    <span
      data-slot="legend-swatch"
      data-shape={shape ?? "square"}
      aria-hidden="true"
      className={cn(legendSwatchVariants({ shape, size }), className)}
      {...props}
    />
  )
}

export { LegendSwatch, legendSwatchVariants }
export type LegendSwatchVariants = VariantProps<typeof legendSwatchVariants>
