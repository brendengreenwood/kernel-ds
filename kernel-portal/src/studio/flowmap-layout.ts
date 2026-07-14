import type { PrototypeManifest, PrototypeScreen } from "./manifest"

/**
 * Pure flow-map layout: manifest -> world-space positions.
 * Directions are horizontal lanes stacked vertically; screens run
 * left-to-right within a lane. All coordinates are world units
 * (the canvas renderer applies pan/zoom on top).
 */

export const CARD_W = 720
export const CARD_H = 520
export const CARD_TITLE_H = 40
const CARD_GAP_X = 160
const LANE_GAP_Y = 140
const LANE_LABEL_H = 64
const ORIGIN_PAD = 48

export interface FlowCard {
  key: string
  directionId: string
  directionTitle: string
  screen: PrototypeScreen
  x: number
  y: number
  w: number
  h: number
}

export interface FlowEdgeLayout {
  from: FlowCard
  to: FlowCard
  label?: string
  backward: boolean
}

export interface FlowLane {
  directionId: string
  title: string
  note?: string
  x: number
  y: number
  w: number
  h: number
}

export interface FlowLayout {
  cards: FlowCard[]
  edges: FlowEdgeLayout[]
  lanes: FlowLane[]
  bounds: { x: number; y: number; w: number; h: number }
}

export function cardKey(directionId: string, screenId: string): string {
  return `${directionId}/${screenId}`
}

export function layoutFlowMap(manifest: PrototypeManifest): FlowLayout {
  const cards: FlowCard[] = []
  const edges: FlowEdgeLayout[] = []
  const lanes: FlowLane[] = []

  let laneY = ORIGIN_PAD
  let maxRight = ORIGIN_PAD

  for (const direction of manifest.directions) {
    const laneTop = laneY
    const cardsTop = laneTop + LANE_LABEL_H
    const byId = new Map<string, FlowCard>()

    direction.screens.forEach((screen, index) => {
      const card: FlowCard = {
        key: cardKey(direction.id, screen.id),
        directionId: direction.id,
        directionTitle: direction.title,
        screen,
        x: ORIGIN_PAD + index * (CARD_W + CARD_GAP_X),
        y: cardsTop + CARD_TITLE_H,
        w: CARD_W,
        h: CARD_H,
      }
      cards.push(card)
      byId.set(screen.id, card)
    })

    for (const edge of direction.edges) {
      const from = byId.get(edge.from)
      const to = byId.get(edge.to)
      if (!from || !to) continue
      edges.push({ from, to, label: edge.label, backward: to.x <= from.x })
    }

    const laneRight = ORIGIN_PAD + direction.screens.length * (CARD_W + CARD_GAP_X) - CARD_GAP_X
    maxRight = Math.max(maxRight, laneRight)
    const laneH = LANE_LABEL_H + CARD_TITLE_H + CARD_H + 72 // room below for backward-edge curves
    lanes.push({
      directionId: direction.id,
      title: direction.title,
      note: direction.note,
      x: ORIGIN_PAD,
      y: laneTop,
      w: laneRight - ORIGIN_PAD,
      h: laneH,
    })
    laneY = laneTop + laneH + LANE_GAP_Y
  }

  const bottom = lanes.length > 0 ? lanes[lanes.length - 1].y + lanes[lanes.length - 1].h : ORIGIN_PAD
  return {
    cards,
    edges,
    lanes,
    bounds: {
      x: 0,
      y: 0,
      w: maxRight + ORIGIN_PAD,
      h: bottom + ORIGIN_PAD,
    },
  }
}
