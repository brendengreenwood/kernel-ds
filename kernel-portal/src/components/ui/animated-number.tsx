"use client"

import * as React from "react"
import NumberFlow, { type Format } from "@number-flow/react"

import { cn } from "@/lib/utils"

/**
 * AnimatedNumber — a number that counts up on mount and rolls when it
 * changes (third-party `@number-flow/react`, MIT; decision 0018).
 *
 * Purposeful polish for a merchant desk: prices, bushels, basis, and
 * settlement totals draw the eye to *what changed*. Timing rides the motion
 * tokens' `--ease-out` curve; NumberFlow honors `prefers-reduced-motion`
 * natively, so the reduced-motion guard (decision 0018) applies for free.
 *
 * Portal-only (decision 0012) — a React engine; the preview shows the number
 * statically.
 *
 *   <AnimatedNumber value={2.41} prefix="$" suffix="M" />
 *   <AnimatedNumber value={-0.12} format={{ minimumFractionDigits: 2 }} />
 */

// same curve as --ease-out (decision 0018); NumberFlow needs a literal easing.
const EASE_OUT = "cubic-bezier(0.2, 0, 0, 1)"

export function AnimatedNumber({
  value,
  format,
  prefix,
  suffix,
  className,
}: {
  value: number
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
}) {
  // Start at 0 and set the real value after mount so it counts up on arrival;
  // later value changes roll the same way.
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    setN(value)
  }, [value])

  return (
    <NumberFlow
      value={n}
      format={format}
      prefix={prefix}
      suffix={suffix}
      willChange
      transformTiming={{ duration: 700, easing: EASE_OUT }}
      spinTiming={{ duration: 750, easing: EASE_OUT }}
      className={cn("tabular-nums", className)}
    />
  )
}
