/* MapLibre's colour parser predates CSS Color 4, so it cannot read the DS's
   oklch() tokens. Resolve a custom property through the browser's own canvas
   (which does understand oklch) into an rgba() string MapLibre accepts. */
let ctx: CanvasRenderingContext2D | null = null

export function cssVarColor(name: string, el: Element = document.documentElement): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  if (!value) return "rgba(0,0,0,0)"
  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!ctx) return value
  ctx.canvas.width = ctx.canvas.height = 1
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`
}
