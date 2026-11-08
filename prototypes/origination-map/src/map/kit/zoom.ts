import type { ExpressionSpecification } from "maplibre-gl"

/** Named zoom stops. Every zoom curve on the map is written against these. */
export const Z = { country: 3, region: 5, state: 7, county: 9, town: 12 } as const

/** Where one source hands a corridor to another. Both sides of a handoff must
    use the same curve so nothing jumps when the source changes. */
export const HANDOFF = {
  // Tiles drop river names when zoomed out; our Natural Earth rivers draw until here.
  rivers: 8,
  // Tile rail is shown from here; our rail network draws below it.
  rail: 9,
} as const

type Stop = number | ExpressionSpecification

/** Linear zoom curve from named stops, e.g. zoomCurve({ country: 1, county: 3 }). */
export function zoomCurve(stops: Partial<Record<keyof typeof Z, Stop>>): ExpressionSpecification {
  const flat = (Object.keys(Z) as (keyof typeof Z)[])
    .filter((k) => stops[k] !== undefined)
    .flatMap((k) => [Z[k], stops[k] as Stop])
  return ["interpolate", ["linear"], ["zoom"], ...flat] as ExpressionSpecification
}
