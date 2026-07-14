import { clearScreenCache, loadKernelRuntime, loadScreenComponent, mountScreen, unmountScreen } from "./loader"
import type { PrototypeManifest } from "./manifest"
import {
  CARD_TITLE_H,
  layoutFlowMap,
  type FlowCard,
  type FlowEdgeLayout,
  type FlowLayout,
} from "./flowmap-layout"

/**
 * HTML-in-Canvas flow map. Facts established by the Phase 0 capability probe:
 * - the `layoutsubtree` attribute goes on the <canvas> element;
 * - only IMMEDIATE CHILDREN of that canvas can be passed to drawElementImage;
 * - offscreen-positioned children (fixed, left:-10000px) are drawable, but
 *   `visibility:hidden` / `display:none` children are not;
 * - children can be reparented out (player overlay) and back while staying
 *   drawable and keeping live input state.
 *
 * So each prototype screen mounts into an offscreen-positioned pool <div>
 * appended directly to the canvas, and the render loop draws those pool
 * containers into the canvas under the current pan/zoom transform.
 */

interface DrawElementImageContext extends CanvasRenderingContext2D {
  drawElementImage?: (element: Element, dx: number, dy: number) => void
}

export function supportsDrawElementImage(): boolean {
  const ctx = document.createElement("canvas").getContext("2d") as DrawElementImageContext | null
  return ctx !== null && typeof ctx.drawElementImage === "function"
}

const MIN_ZOOM = 0.05
const MAX_ZOOM = 2
const CLICK_SLOP_PX = 5

function poolStyle(card: FlowCard): string {
  return [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${card.w}px`,
    `height:${card.h}px`,
    "overflow:hidden",
    "background:var(--background)",
    "pointer-events:none",
  ].join(";")
}

interface ThemeColors {
  background: string
  surface: string
  border: string
  foreground: string
  muted: string
  accent: string
}

export class FlowMapController {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: DrawElementImageContext
  private layout: FlowLayout | null = null
  private manifest: PrototypeManifest | null = null
  private containers = new Map<string, HTMLDivElement>()
  private mounts = new Map<string, Promise<HTMLDivElement>>()
  private pan = { x: 0, y: 0 }
  private zoom = 0.3
  private dirty = true
  private rafId = 0
  private destroyed = false
  private loadToken = 0
  private retryScheduled = false
  private readonly cleanups: Array<() => void> = []

  /** Fired when a screen card on the map is clicked (not dragged). */
  onCardClick?: (cardKey: string) => void
  /** Fired when a mounted screen calls its `navigate(screenId)` prop. */
  onNavigate?: (directionId: string, screenId: string) => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    // Required for drawElementImage; children of the canvas get layout.
    canvas.setAttribute("layoutsubtree", "")
    const ctx = canvas.getContext("2d") as DrawElementImageContext | null
    if (!ctx || typeof ctx.drawElementImage !== "function") {
      throw new Error("drawElementImage is not available on this canvas context")
    }
    this.ctx = ctx

    this.attachPanZoom()
    const resize = new ResizeObserver(() => {
      this.syncCanvasSize()
      this.markDirty()
    })
    resize.observe(canvas)
    this.cleanups.push(() => resize.disconnect())
    this.syncCanvasSize()
    this.rafId = requestAnimationFrame(this.frame)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.rafId)
    for (const cleanup of this.cleanups) cleanup()
    this.clearContainers()
  }

  markDirty(): void {
    this.dirty = true
  }

  async loadPrototype(manifest: PrototypeManifest): Promise<void> {
    const token = ++this.loadToken
    this.clearContainers()
    // A regenerated prototype reuses its id; drop this session's compiled
    // screens so the map shows the new files, not the cached ones.
    clearScreenCache(manifest.id)
    this.manifest = manifest
    this.layout = layoutFlowMap(manifest)
    this.fitToBounds()
    this.markDirty()

    // Agent-generated screens can individually fail (bad JSX, missing default
    // export); mount the rest and surface the failures afterwards.
    const failures: string[] = []
    for (const card of this.layout.cards) {
      if (this.destroyed || token !== this.loadToken) return
      try {
        await this.ensureScreen(card.key, token)
      } catch (cause) {
        failures.push(`${card.key}: ${cause instanceof Error ? cause.message : String(cause)}`)
      }
    }
    // The vendored React commits asynchronously and fonts/styles settle late;
    // repaint a few times after mounting so the map catches up.
    for (const delay of [50, 200, 500, 1000, 2000]) {
      setTimeout(() => this.markDirty(), delay)
    }
    if (failures.length > 0) {
      throw new Error(`Some screens failed to mount — ${failures.join("; ")}`)
    }
  }

  /**
   * Ensure a screen is mounted into its pool container (creating and mounting
   * it on demand) and return the container. The container is an immediate
   * child of the canvas unless it is currently borrowed by the player.
   */
  async ensureScreen(cardKey: string, token = this.loadToken): Promise<HTMLDivElement | null> {
    const pending = this.mounts.get(cardKey)
    if (pending) return pending
    const manifest = this.manifest
    const card = this.layout?.cards.find((candidate) => candidate.key === cardKey)
    if (!manifest || !card) return null

    const mount = (async () => {
      const runtime = await loadKernelRuntime()
      const container = document.createElement("div")
      container.dataset.flowCard = card.key
      container.style.cssText = poolStyle(card)
      this.canvas.appendChild(container)
      this.containers.set(card.key, container)

      const component = await loadScreenComponent(manifest.id, card.screen.file)
      await mountScreen(container, component, {
        navigate: (screenId: string) => this.onNavigate?.(card.directionId, screenId),
        Kernel: runtime.Kernel,
      })
      this.markDirty()
      return container
    })()
    this.mounts.set(cardKey, mount)
    let container: HTMLDivElement
    try {
      container = await mount
    } catch (cause) {
      // Failed mount (fetch error, malformed JSX, no default export): forget
      // the rejected promise so a later attempt retries, and drop the
      // already-appended placeholder container.
      this.mounts.delete(cardKey)
      const placeholder = this.containers.get(cardKey)
      if (placeholder) {
        this.containers.delete(cardKey)
        unmountScreen(placeholder)
        placeholder.remove()
      }
      throw cause
    }
    if (this.destroyed || token !== this.loadToken) {
      // A newer prototype load superseded this mount: discard it.
      this.mounts.delete(cardKey)
      if (this.containers.get(cardKey) === container) this.containers.delete(cardKey)
      unmountScreen(container)
      container.remove()
      return null
    }
    return container
  }

  /**
   * Hand a screen's container to the player overlay. The caller reparents and
   * restyles it; `returnScreen` undoes both. Reparenting preserves the mounted
   * React subtree and its input state (verified by the Phase 0 probe).
   */
  async borrowScreen(cardKey: string): Promise<HTMLDivElement | null> {
    return this.ensureScreen(cardKey)
  }

  /** Return a borrowed container to the canvas pool so it is drawable again. */
  returnScreen(cardKey: string): void {
    const container = this.containers.get(cardKey)
    const card = this.layout?.cards.find((candidate) => candidate.key === cardKey)
    if (!container || !card) return
    container.style.cssText = poolStyle(card)
    if (container.parentElement !== this.canvas) this.canvas.appendChild(container)
    this.markDirty()
    // Repaint after the reparented subtree settles back into canvas layout.
    for (const delay of [50, 200, 500]) {
      setTimeout(() => this.markDirty(), delay)
    }
  }

  /** Client-space center of a card — lets drivers click cards from outside. */
  clientPointForCard(cardKey: string): { x: number; y: number } | null {
    const card = this.layout?.cards.find((candidate) => candidate.key === cardKey)
    if (!card) return null
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: rect.left + this.pan.x + (card.x + card.w / 2) * this.zoom,
      y: rect.top + this.pan.y + (card.y + card.h / 2) * this.zoom,
    }
  }

  private hitTest(clientX: number, clientY: number): FlowCard | null {
    if (!this.layout) return null
    const rect = this.canvas.getBoundingClientRect()
    const worldX = (clientX - rect.left - this.pan.x) / this.zoom
    const worldY = (clientY - rect.top - this.pan.y) / this.zoom
    for (const card of this.layout.cards) {
      if (
        worldX >= card.x &&
        worldX <= card.x + card.w &&
        worldY >= card.y - CARD_TITLE_H &&
        worldY <= card.y + card.h
      ) {
        return card
      }
    }
    return null
  }

  private clearContainers(): void {
    for (const container of this.containers.values()) {
      unmountScreen(container)
      container.remove()
    }
    this.containers.clear()
    this.mounts.clear()
  }

  private syncCanvasSize(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
  }

  private fitToBounds(): void {
    if (!this.layout) return
    const rect = this.canvas.getBoundingClientRect()
    const { bounds } = this.layout
    const margin = 48
    const zoom = Math.min(
      (rect.width - margin * 2) / bounds.w,
      (rect.height - margin * 2) / bounds.h,
      1,
    )
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
    this.pan = {
      x: (rect.width - bounds.w * this.zoom) / 2,
      y: Math.max(margin / 2, (rect.height - bounds.h * this.zoom) / 2),
    }
  }

  private attachPanZoom(): void {
    const canvas = this.canvas
    let dragging = false
    let last = { x: 0, y: 0 }
    let travel = 0

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      travel = 0
      last = { x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      travel += Math.abs(event.clientX - last.x) + Math.abs(event.clientY - last.y)
      this.pan.x += event.clientX - last.x
      this.pan.y += event.clientY - last.y
      last = { x: event.clientX, y: event.clientY }
      this.markDirty()
    }
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      // A press that barely moved is a click: hit-test the map cards.
      if (event.type === "pointerup" && travel <= CLICK_SLOP_PX) {
        const card = this.hitTest(event.clientX, event.clientY)
        if (card) this.onCardClick?.(card.key)
      }
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * Math.exp(-event.deltaY * 0.0015)))
      // Anchor the zoom on the cursor: keep the world point under it fixed.
      const worldX = (cursor.x - this.pan.x) / this.zoom
      const worldY = (cursor.y - this.pan.y) / this.zoom
      this.zoom = nextZoom
      this.pan = { x: cursor.x - worldX * nextZoom, y: cursor.y - worldY * nextZoom }
      this.markDirty()
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    this.cleanups.push(() => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
      canvas.removeEventListener("wheel", onWheel)
    })
  }

  private frame = (): void => {
    if (this.destroyed) return
    if (this.dirty) {
      this.dirty = false
      this.draw()
    }
    this.rafId = requestAnimationFrame(this.frame)
  }

  private themeColors(): ThemeColors {
    const style = getComputedStyle(this.canvas)
    const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback
    return {
      background: read("--muted", "#f4f4f5"),
      surface: read("--background", "#ffffff"),
      border: read("--border", "#d4d4d8"),
      foreground: read("--foreground", "#18181b"),
      muted: read("--muted-foreground", "#71717a"),
      accent: read("--primary", "#18181b"),
    }
  }

  private draw(): void {
    const ctx = this.ctx
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    const colors = this.themeColors()

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, rect.width, rect.height)
    if (!this.layout) return

    ctx.setTransform(dpr * this.zoom, 0, 0, dpr * this.zoom, dpr * this.pan.x, dpr * this.pan.y)
    const visible = {
      x: -this.pan.x / this.zoom,
      y: -this.pan.y / this.zoom,
      w: rect.width / this.zoom,
      h: rect.height / this.zoom,
    }

    for (const lane of this.layout.lanes) this.drawLaneLabel(lane.title, lane.note, lane.x, lane.y, colors)
    for (const edge of this.layout.edges) this.drawEdge(edge, colors)
    for (const card of this.layout.cards) {
      const top = card.y - CARD_TITLE_H
      const intersects =
        card.x < visible.x + visible.w &&
        card.x + card.w > visible.x &&
        top < visible.y + visible.h &&
        card.y + card.h > visible.y
      if (!intersects) continue
      this.drawCard(card, colors)
    }
  }

  private drawLaneLabel(
    title: string,
    note: string | undefined,
    x: number,
    y: number,
    colors: ThemeColors,
  ): void {
    const ctx = this.ctx
    ctx.fillStyle = colors.foreground
    ctx.font = "600 26px system-ui, sans-serif"
    ctx.textBaseline = "top"
    ctx.fillText(title, x, y)
    if (note) {
      ctx.fillStyle = colors.muted
      ctx.font = "400 18px system-ui, sans-serif"
      ctx.fillText(note, x, y + 32)
    }
  }

  private drawEdge(edge: FlowEdgeLayout, colors: ThemeColors): void {
    const ctx = this.ctx
    ctx.strokeStyle = colors.muted
    ctx.fillStyle = colors.muted
    ctx.lineWidth = 2.5
    ctx.beginPath()

    let labelX: number
    let labelY: number
    let arrow: { x: number; y: number; angle: number }
    if (!edge.backward) {
      const startX = edge.from.x + edge.from.w
      const startY = edge.from.y + edge.from.h / 2
      const endX = edge.to.x
      const endY = edge.to.y + edge.to.h / 2
      const dx = Math.max(48, (endX - startX) / 2)
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(startX + dx, startY, endX - dx, endY, endX, endY)
      arrow = { x: endX, y: endY, angle: 0 }
      labelX = (startX + endX) / 2
      labelY = (startY + endY) / 2 - 16
    } else {
      // Backward edge: loop underneath the cards.
      const startX = edge.from.x + edge.from.w / 2
      const startY = edge.from.y + edge.from.h
      const endX = edge.to.x + edge.to.w / 2
      const endY = edge.to.y + edge.to.h
      const dip = Math.max(startY, endY) + 56
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(startX, dip, endX, dip, endX, endY)
      arrow = { x: endX, y: endY, angle: -Math.PI / 2 }
      labelX = (startX + endX) / 2
      labelY = dip - 8
    }
    ctx.stroke()
    this.drawArrowHead(arrow.x, arrow.y, arrow.angle)

    if (edge.label) {
      ctx.font = "500 17px system-ui, sans-serif"
      ctx.textBaseline = "bottom"
      const width = ctx.measureText(edge.label).width
      ctx.fillStyle = colors.background
      ctx.fillRect(labelX - width / 2 - 8, labelY - 22, width + 16, 26)
      ctx.fillStyle = colors.muted
      ctx.fillText(edge.label, labelX - width / 2, labelY)
    }
  }

  private drawArrowHead(x: number, y: number, angle: number): void {
    const ctx = this.ctx
    const size = 12
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-size, -size / 2)
    ctx.lineTo(-size, size / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private drawCard(card: FlowCard, colors: ThemeColors): void {
    const ctx = this.ctx

    ctx.fillStyle = colors.muted
    ctx.font = "500 20px system-ui, sans-serif"
    ctx.textBaseline = "bottom"
    ctx.fillText(card.screen.title, card.x + 2, card.y - 10)

    ctx.fillStyle = colors.surface
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(card.x, card.y, card.w, card.h, 10)
    ctx.fill()

    const container = this.containers.get(card.key)
    if (container && container.parentElement !== this.canvas) {
      // Borrowed by the player overlay: not drawable until returned.
      ctx.fillStyle = colors.muted
      ctx.font = "500 22px system-ui, sans-serif"
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"
      ctx.fillText("Open in player", card.x + card.w / 2, card.y + card.h / 2)
      ctx.textAlign = "left"
    } else if (container && typeof this.ctx.drawElementImage === "function") {
      try {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(card.x, card.y, card.w, card.h, 10)
        ctx.clip()
        this.ctx.drawElementImage(container, card.x, card.y)
        ctx.restore()
      } catch {
        // "No cached paint record" while the screen is still committing:
        // retry shortly instead of spinning every frame.
        ctx.restore()
        this.scheduleRetry()
      }
    }

    ctx.beginPath()
    ctx.roundRect(card.x, card.y, card.w, card.h, 10)
    ctx.stroke()
  }

  private scheduleRetry(): void {
    if (this.retryScheduled) return
    this.retryScheduled = true
    setTimeout(() => {
      this.retryScheduled = false
      this.markDirty()
    }, 250)
  }
}
