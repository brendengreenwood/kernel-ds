import type { Map as MLMap } from "maplibre-gl"

/* One glyph per shape; shape carries kind, color carries meaning (redundant coding:
   the kind key never depends on hue). i circle, r triangle, p square, x diamond. */
export type Glyph = "i" | "r" | "p" | "x"
export const GLYPHS: Glyph[] = ["i", "r", "p", "x"]

// shade = [r, g, b, alpha] bakes a soft drop shadow as a plain RGBA image instead of an SDF.
// SDF halos with blur wider than the field's falloff fill the whole icon quad, which shows up
// as faint squares at high zoom; a pre-blurred image has no such limit.
export function shapeImage(type: Glyph, shade?: [number, number, number, number]): ImageData {
  // A true signed distance field (MapLibre/TinySDF convention: edge at 0.75, falling off
  // over RADIUS px), so icons stay crisp at any icon-size and can still be recolored.
  // Canvas and falloff are padded well past the shape so thick outlines are not clipped.
  const n = 80
  const RADIUS = 20
  const m = n / 2
  const r = 48 * 0.36
  const poly: [number, number][] | null =
    type === "r"
      ? [[m, m - r * 1.05], [m + r * 1.05, m + r * 0.8], [m - r * 1.05, m + r * 0.8]]
      : type === "p"
        ? [[m - r * 0.85, m - r * 0.85], [m + r * 0.85, m - r * 0.85], [m + r * 0.85, m + r * 0.85], [m - r * 0.85, m + r * 0.85]]
        : type === "x"
          ? [[m, m - r * 1.1], [m + r * 1.1, m], [m, m + r * 1.1], [m - r * 1.1, m]]
          : null
  const dist = (x: number, y: number) => {
    if (!poly) return Math.hypot(x - m, y - m) - r * 0.92
    let d = Infinity
    let inside = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, ay] = poly[j]
      const [bx, by] = poly[i]
      const dx = bx - ax
      const dy = by - ay
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
      d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy))
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside
    }
    return inside ? -d : d
  }
  const img = new ImageData(n, n)
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const d = dist(x + 0.5, y + 0.5)
      const i = (y * n + x) * 4
      if (shade) {
        const t = Math.max(0, Math.min(1, (d + 1) / 7))
        img.data[i] = shade[0]
        img.data[i + 1] = shade[1]
        img.data[i + 2] = shade[2]
        img.data[i + 3] = Math.round(255 * shade[3] * (1 - t * t * (3 - 2 * t)))
      } else img.data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, 0.75 - d / RADIUS)))
    }
  return img
}

/** Registers om-<glyph> (SDF, recolorable) and om-shadow-<glyph> (pre-blurred) images. */
export function installGlyphs(map: MLMap, shade: [number, number, number, number]) {
  for (const t of GLYPHS) {
    if (map.hasImage(`om-${t}`)) map.removeImage(`om-${t}`)
    map.addImage(`om-${t}`, shapeImage(t), { sdf: true, pixelRatio: 2 })
    if (map.hasImage(`om-shadow-${t}`)) map.removeImage(`om-shadow-${t}`)
    map.addImage(`om-shadow-${t}`, shapeImage(t, shade), { pixelRatio: 2 })
  }
}
