import { cn } from "@/lib/utils"
import type { Glyph } from "@app/map/kit/glyphs"

/** The map's glyphs as inline SVG for legends and docs.
    Hollow = a destination (where grain goes); filled = a company buying point. */
export function GlyphIcon({ type, className, hollow }: { type: Glyph; className?: string; hollow?: boolean }) {
  const d = {
    circle: <circle cx="6" cy="6" r="4" />,
    triangle: <path d="M6 1.4 10.6 9.6H1.4Z" />,
    square: <rect x="2" y="2" width="8" height="8" />,
    diamond: <path d="M6 1 11 6 6 11 1 6Z" />,
  }[type]
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={cn("size-3 shrink-0 fill-current", hollow && "fill-card stroke-current [stroke-width:1.5]", className)}>
      {d}
    </svg>
  )
}
