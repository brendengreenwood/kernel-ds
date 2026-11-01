"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { Pause, Play, RotateCcw } from "@kernel/ui/icon"
import { Button, CommodityBadge } from "@kernel/ui"
import { cn } from "@kernel/ui/utils"
import { typeStyles } from "@/lib/type-styles"

/* ──────────────────────────────────────────────────────────────────────────
 * Grain dump — an isometric "iso glow" illustration.
 *
 * A hopper-bottom truck pulls onto the receiving pit, opens its gates,
 * corn streams through the grate, the bucket leg lifts it to the bin, and
 * the truck pulls out. One deterministic timeline drives everything, so
 * every frame can be rendered from a single `t` (scrub, pause, replay).
 *
 * Colour is all tokens (neutral faces, --primary edges, --commodity-corn
 * glow) so the scene follows light/dark. Easing reuses the motion-token
 * curves (decision 0018) evaluated in JS. Reduced motion → a still frame
 * mid-unload, with Play available as an explicit opt-in.
 * ────────────────────────────────────────────────────────────────────────── */

// ── iso projection (2:1 dimetric) ───────────────────────────────────────
const S = 22 // px per world unit
const COS = 0.866
type V3 = [number, number, number]
const P = (x: number, y: number, z: number): [number, number] => [(x - y) * COS * S, (x + y) * 0.5 * S - z * S]
const pts = (...v: V3[]) => v.map((p) => P(...p).map((n) => n.toFixed(1)).join(",")).join(" ")

// ── motion-token curves (--ease-out / --ease-in-out), solved in JS ───────
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u
  const sy = (u: number) => ((ay * u + by) * u + cy) * u
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx
  return (x: number) => {
    let u = x
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x
      const d = dx(u)
      if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break
      u -= e / d
    }
    return sy(Math.min(1, Math.max(0, u)))
  }
}
const easeOut = bezier(0.2, 0, 0, 1)
const easeInOut = bezier(0.5, 0, 0.2, 1)
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

// ── timeline (seconds) ──────────────────────────────────────────────────
const LOOP = 15
const STOP_X = 8.2 // trailer rear x when parked over the pit
const LOAD_BU = 1020

function frame(t: number) {
  const arrive = easeOut(seg(t, 0, 4))
  const depart = easeInOut(seg(t, 11.2, 14.4))
  const x0 = t < 11.2 ? lerp(-22, STOP_X, arrive) : lerp(STOP_X, 30, depart)
  const gate = t < 10.5 ? seg(t, 4, 5) : 1 - seg(t, 10.5, 11.2)
  const dump = easeInOut(seg(t, 5, 10.5))
  const stream = Math.min(seg(t, 4.6, 5.4), 1 - seg(t, 10, 10.6))
  const leg = Math.min(seg(t, 5.2, 6), 1 - seg(t, 11.5, 12.8))
  const binFill = t < 14 ? 0.46 + 0.16 * easeInOut(seg(t, 5.6, 12.4)) : lerp(0.62, 0.46, easeInOut(seg(t, 14, 15)))
  const phase =
    t < 4 ? "Inbound · scaled in" : t < 5 ? "On the pit" : t < 10.5 ? "Unloading" : t < 14 ? "Released · scaling out" : "Pit clear"
  return { t, x0, gate, level: 1 - dump, stream, leg, binFill, bu: Math.round(LOAD_BU * dump), phase }
}
type Frame = ReturnType<typeof frame>

// ── materials: three faces per solid, mixed from theme tokens ───────────
const mix = (a: string, b: string, pct: number) => `color-mix(in oklch, ${a} ${pct}%, ${b})`
const M = {
  concrete: { top: mix("var(--card)", "var(--foreground)", 94), left: mix("var(--card)", "var(--foreground)", 84), right: mix("var(--card)", "var(--foreground)", 74) },
  steel: { top: mix("var(--muted)", "var(--foreground)", 90), left: mix("var(--muted)", "var(--foreground)", 80), right: mix("var(--muted)", "var(--foreground)", 68) },
  cab: { top: mix("var(--primary)", "var(--card)", 70), left: mix("var(--primary)", "var(--foreground)", 88), right: mix("var(--primary)", "var(--foreground)", 70) },
}
type Mat = (typeof M)[keyof typeof M]
const EDGE = "color-mix(in oklch, var(--primary) 55%, transparent)"
const CORN = "var(--commodity-corn-400)"
const CORN_HOT = "var(--commodity-corn-300)"

function Box({ x, y, z, dx, dy, dz, mat, edge = EDGE, top = true }: { x: number; y: number; z: number; dx: number; dy: number; dz: number; mat: Mat; edge?: string; top?: boolean }) {
  const [x1, y1, z1] = [x + dx, y + dy, z + dz]
  return (
    <g stroke={edge} strokeWidth={0.75} strokeLinejoin="round">
      <polygon points={pts([x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1])} fill={mat.left} />
      <polygon points={pts([x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1])} fill={mat.right} />
      {top && <polygon points={pts([x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1])} fill={mat.top} />}
    </g>
  )
}

/** Vertical bin: shaded cylinder + cone roof + glowing fill gauge. */
function Bin({ cx, cy, r, h, fill, active, gradId, glowId }: { cx: number; cy: number; r: number; h: number; fill: number; active: boolean; gradId: string; glowId: string }) {
  const [bx, by] = P(cx, cy, 0)
  const [, ty] = P(cx, cy, h)
  const [, ay] = P(cx, cy, h + r * 0.85)
  const rx = r * S * 1.2247
  const ry = r * S * 0.7071
  const rings = [0.2, 0.4, 0.6, 0.8]
  const gaugeTop = by + ry - (by - ty) * fill
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={rx * 1.04} ry={ry * 1.04} fill="var(--foreground)" opacity={0.08} />
      <path d={`M${bx - rx},${ty} L${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${bx + rx},${ty} Z`} fill={`url(#${gradId})`} stroke={EDGE} strokeWidth={0.75} />
      {rings.map((k) => (
        <path key={k} d={`M${bx - rx},${by - (by - ty) * k} A${rx},${ry} 0 0 0 ${bx + rx},${by - (by - ty) * k}`} fill="none" stroke="var(--foreground)" strokeOpacity={0.12} strokeWidth={0.75} />
      ))}
      <path d={`M${bx - rx},${ty} A${rx},${ry} 0 0 0 ${bx + rx},${ty} L${bx},${ay} Z`} fill={M.steel.top} stroke={EDGE} strokeWidth={0.75} strokeLinejoin="round" />
      {/* fill gauge */}
      <line x1={bx + rx * 0.45} y1={by + ry * 0.9 - 4} x2={bx + rx * 0.45} y2={ty + ry * 0.9 + 4} stroke="var(--foreground)" strokeOpacity={0.14} strokeWidth={3} strokeLinecap="round" />
      <line
        x1={bx + rx * 0.45}
        y1={by + ry * 0.9 - 4}
        x2={bx + rx * 0.45}
        y2={Math.min(by + ry * 0.9 - 4, gaugeTop + ry * 0.9 - ry)}
        stroke={CORN}
        strokeWidth={3}
        strokeLinecap="round"
        filter={active ? `url(#${glowId})` : undefined}
        opacity={active ? 1 : 0.7}
      />
    </g>
  )
}

function Wheel({ x, y, r, spin }: { x: number; y: number; r: number; spin: number }) {
  const ring = (rr: number) =>
    Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      return P(x + Math.cos(a) * rr, y, r + Math.sin(a) * rr).map((n) => n.toFixed(1)).join(",")
    }).join(" ")
  const spoke = (a: number) => {
    const [ax, ay] = P(x + Math.cos(a) * r * 0.55, y, r + Math.sin(a) * r * 0.55)
    const [bx, by] = P(x - Math.cos(a) * r * 0.55, y, r - Math.sin(a) * r * 0.55)
    return <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--background)" strokeOpacity={0.55} strokeWidth={1.2} />
  }
  return (
    <g>
      <polygon points={ring(r)} fill={mix("var(--foreground)", "var(--background)", 82)} stroke={EDGE} strokeWidth={0.6} />
      <polygon points={ring(r * 0.55)} fill={mix("var(--foreground)", "var(--background)", 55)} />
      {spoke(spin)}
      {spoke(spin + Math.PI / 2)}
    </g>
  )
}

function Truck({ f, ids }: { f: Frame; ids: Ids }) {
  const x0 = f.x0
  const [ty0, ty1] = [8.7, 10.3] // trailer y span
  const [tz0, tz1] = [1.6, 3.5]
  const L = 6
  const spin = -(x0 / 0.5) // rolling without slipping
  const rim: V3[] = [[x0, ty0, tz1], [x0 + L, ty0, tz1], [x0 + L, ty1, tz1], [x0, ty1, tz1]]
  const grainZ = tz0 + 0.25 + f.level * 1.65
  const gates = [x0 + 2.2, x0 + 4.0]
  return (
    <g>
      {/* ground shadow */}
      <polygon points={pts([x0 - 0.2, ty0 + 0.1, 0], [x0 + 9.3, ty0 + 0.1, 0], [x0 + 9.3, ty1 + 0.5, 0], [x0 - 0.2, ty1 + 0.5, 0])} fill="var(--foreground)" opacity={0.1} />
      {/* frame rail */}
      <Box x={x0 - 0.1} y={ty0 + 0.3} z={1.0} dx={L + 3} dy={1.0} dz={0.3} mat={M.steel} />
      {/* hopper bottoms (two inverted pyramids, +y faces) */}
      {gates.map((g) => (
        <g key={g} stroke={EDGE} strokeWidth={0.75} strokeLinejoin="round">
          <polygon points={pts([g - 1.1, ty1, tz0], [g + 1.1, ty1, tz0], [g + 0.3, 9.8, 0.5], [g - 0.3, 9.8, 0.5])} fill={M.steel.left} />
          <polygon points={pts([g + 1.1, ty0, tz0], [g + 1.1, ty1, tz0], [g + 0.3, 9.8, 0.5], [g + 0.3, 9.2, 0.5])} fill={M.steel.right} />
          {/* gate slide — glows while open */}
          <polygon points={pts([g - 0.3, 9.2, 0.48], [g + 0.3, 9.2, 0.48], [g + 0.3, 9.8, 0.48], [g - 0.3, 9.8, 0.48])} fill={CORN_HOT} opacity={f.gate} filter={`url(#${ids.glow})`} />
        </g>
      ))}
      {/* grain stream */}
      <GrainStream gates={gates} f={f} ids={ids} />
      {/* trailer box (open top) */}
      <Box x={x0} y={ty0} z={tz0} dx={L} dy={ty1 - ty0} dz={tz1 - tz0} mat={M.steel} top={false} />
      <clipPath id={ids.rim}>
        <polygon points={pts(...rim)} />
      </clipPath>
      <g clipPath={`url(#${ids.rim})`}>
        <polygon points={pts(...rim)} fill={M.steel.right} />
        {/* inner far walls, seen over the near rim */}
        <polygon points={pts([x0, ty0, tz0], [x0 + L, ty0, tz0], [x0 + L, ty0, tz1], [x0, ty0, tz1])} fill={M.steel.left} />
        <polygon points={pts([x0, ty0, tz0], [x0, ty1, tz0], [x0, ty1, tz1], [x0, ty0, tz1])} fill={M.steel.top} />
        <polygon points={pts(...rim)} fill="var(--foreground)" opacity={0.12} />
        <polygon
          points={pts([x0, ty0, grainZ], [x0 + L, ty0, grainZ], [x0 + L, ty1, grainZ], [x0, ty1, grainZ])}
          fill={CORN}
          opacity={f.level > 0.01 ? 1 : 0}
        />
        <polygon
          points={pts([x0 + 0.4, ty0 + 0.3, grainZ + 0.12], [x0 + L - 0.4, ty0 + 0.3, grainZ + 0.12], [x0 + L - 0.4, ty1 - 0.3, grainZ + 0.12], [x0 + 0.4, ty1 - 0.3, grainZ + 0.12])}
          fill={CORN_HOT}
          opacity={f.level > 0.01 ? 0.7 : 0}
          filter={`url(#${ids.glow})`}
        />
      </g>
      <polygon points={pts(...rim)} fill="none" stroke={EDGE} strokeWidth={1} />
      {/* ribs on the visible side */}
      {[1, 2, 3, 4, 5].map((k) => (
        <polyline key={k} points={pts([x0 + k, ty1, tz0], [x0 + k, ty1, tz1])} stroke="var(--foreground)" strokeOpacity={0.12} />
      ))}
      {/* cab + hood */}
      <Box x={x0 + 6.3} y={8.8} z={0.95} dx={1.6} dy={1.4} dz={2.1} mat={M.cab} />
      <Box x={x0 + 7.9} y={8.9} z={0.95} dx={1.2} dy={1.2} dz={1.15} mat={M.cab} />
      {/* windshield + side window */}
      <polygon points={pts([x0 + 7.9, 9.0, 2.0], [x0 + 7.9, 10.0, 2.0], [x0 + 7.9, 10.0, 2.85], [x0 + 7.9, 9.0, 2.85])} fill="var(--primary)" opacity={0.35} />
      <polygon points={pts([x0 + 6.5, 10.2, 2.0], [x0 + 7.6, 10.2, 2.0], [x0 + 7.6, 10.2, 2.8], [x0 + 6.5, 10.2, 2.8])} fill="var(--background)" opacity={0.55} />
      {/* headlights + beam */}
      <polygon points={pts([x0 + 9.1, 9.0, 0.3], [x0 + 12.5, 8.4, 0], [x0 + 12.5, 10.6, 0], [x0 + 9.1, 10.0, 0.3])} fill={`url(#${ids.beam})`} />
      {[9.15, 9.85].map((y) => {
        const [hx, hy] = P(x0 + 9.1, y, 1.4)
        return <circle key={y} cx={hx} cy={hy} r={1.8} fill={CORN_HOT} filter={`url(#${ids.glow})`} />
      })}
      {/* wheels on the near side */}
      {[x0 + 0.6, x0 + 1.4, x0 + 6.7, x0 + 8.5].map((wx) => (
        <Wheel key={wx} x={wx} y={10.32} r={0.5} spin={spin} />
      ))}
    </g>
  )
}

function GrainStream({ gates, f, ids }: { gates: number[]; f: Frame; ids: Ids }) {
  if (f.stream <= 0) return null
  const N = 16
  const t = f.t
  return (
    <g filter={`url(#${ids.glow})`}>
      {gates.flatMap((g, gi) =>
        Array.from({ length: N }, (_, i) => {
          const u = (t * 1.8 + i / N + gi * 0.37) % 1
          const z = 0.48 * (1 - u * u)
          const jx = (hash(i + gi * 31) - 0.5) * 0.4 * (0.4 + u)
          const jy = (hash(i * 7 + gi) - 0.5) * 0.4 * (0.4 + u)
          const [px, py] = P(g + jx, 9.5 + jy, z)
          return <circle key={`${gi}-${i}`} cx={px} cy={py} r={1.1 + hash(i) * 0.7} fill={CORN_HOT} opacity={f.stream * (0.5 + 0.5 * (1 - u))} />
        }),
      )}
      {gates.map((g) => {
        const [ax, ay] = P(g, 9.5, 0.46)
        const [bx, by] = P(g, 9.5, 0.02)
        const [hx, hy] = P(g, 9.5, 0.0)
        return (
          <g key={`c${g}`}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={CORN} strokeWidth={5} strokeLinecap="round" opacity={f.stream * 0.75} />
            <ellipse cx={hx} cy={hy} rx={9 * f.stream} ry={4.5 * f.stream} fill={CORN_HOT} opacity={0.9} />
          </g>
        )
      })}
    </g>
  )
}

/** Rising dust over the pit — larger, softer, slower than the kernels. */
function Dust({ f }: { f: Frame }) {
  if (f.stream <= 0) return null
  const t = f.t
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const u = (t * 0.35 + i / 10) % 1
        const [px, py] = P(10.0 + hash(i * 3) * 4, 9.0 + hash(i * 5) * 1.2, u * 1.6)
        return <circle key={i} cx={px} cy={py} r={4 + u * 9} fill={CORN} opacity={f.stream * 0.16 * (1 - u)} />
      })}
    </g>
  )
}

type Ids = { glow: string; glowSoft: string; bin: string; beam: string; pit: string; rim: string; grid: string; fade: string }

function Scene({ f, ids, t }: { f: Frame; ids: Ids; t: number }) {
  // Static layout
  const bins = [
    { cx: 2.4, cy: 2.6, r: 1.45, h: 6.4 },
    { cx: 5.7, cy: 2.6, r: 1.45, h: 6.4 },
    { cx: 9.0, cy: 2.6, r: 1.45, h: 6.4 },
  ]
  const LEG: V3 = [10.9, 6.4, 0]
  const legTop = 11.2
  const target = bins[2]
  const flow = -t * 26 // dash offset (px) — belt speed
  const [lgx0, lgy0] = P(LEG[0] + 0.5, LEG[1] + 1.0, 0.1)
  const [lgx1, lgy1] = P(LEG[0] + 0.5, LEG[1] + 1.0, legTop)
  const [spx0, spy0] = P(LEG[0] + 0.5, LEG[1] + 0.5, legTop + 0.6)
  const [spx1, spy1] = P(target.cx, target.cy, target.h + target.r * 0.85)
  const [pbx, pby] = P(11.5, 9.5, 0.02)
  const [lbx, lby] = P(LEG[0] + 0.5, LEG[1] + 1.0, 0.02)

  const gridLines: React.ReactNode[] = []
  for (let k = -6; k <= 22; k++) {
    gridLines.push(<polyline key={`a${k}`} points={pts([k, -4, 0], [k, 16, 0])} />)
    gridLines.push(<polyline key={`b${k}`} points={pts([-6, k, 0], [22, k, 0])} />)
  }

  return (
    <>
      <defs>
        <filter id={ids.glow} filterUnits="userSpaceOnUse" x="-320" y="-180" width="780" height="540">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={ids.glowSoft} filterUnits="userSpaceOnUse" x="-320" y="-180" width="780" height="540">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id={ids.bin} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={M.steel.left} />
          <stop offset="0.35" stopColor={M.steel.top} />
          <stop offset="1" stopColor={M.steel.right} />
        </linearGradient>
        <linearGradient id={ids.beam} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--commodity-corn-200)" stopOpacity={0.35} />
          <stop offset="1" stopColor="var(--commodity-corn-200)" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={ids.fade} cx="0.5" cy="0.55" r="0.55">
          <stop offset="0.4" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={ids.grid}>
          <rect x="-420" y="-220" width="900" height="700" fill={`url(#${ids.fade})`} />
        </mask>
      </defs>

      {/* ground grid */}
      <g mask={`url(#${ids.grid})`} stroke="var(--primary)" strokeOpacity={0.14} strokeWidth={0.6}>
        {gridLines}
      </g>

      {/* drive lane + pit */}
      <polygon points={pts([-30, 8.2, 0], [50, 8.2, 0], [50, 10.9, 0], [-30, 10.9, 0])} fill={M.concrete.top} opacity={0.75} />
      <polyline points={pts([-30, 8.2, 0], [50, 8.2, 0])} stroke={EDGE} strokeWidth={0.75} fill="none" />
      <polyline points={pts([-30, 10.9, 0], [50, 10.9, 0])} stroke={EDGE} strokeWidth={0.75} fill="none" />
      <polygon points={pts([9.4, 8.7, 0.01], [13.6, 8.7, 0.01], [13.6, 10.3, 0.01], [9.4, 10.3, 0.01])} fill={mix("var(--foreground)", "var(--background)", 75)} stroke={EDGE} />
      {/* pit glow under the grate */}
      <polygon points={pts([9.6, 8.9, 0.01], [13.4, 8.9, 0.01], [13.4, 10.1, 0.01], [9.6, 10.1, 0.01])} fill={CORN} opacity={f.stream * 0.85} filter={`url(#${ids.glowSoft})`} />
      <polygon points={pts([9.6, 8.9, 0.01], [13.4, 8.9, 0.01], [13.4, 10.1, 0.01], [9.6, 10.1, 0.01])} fill={CORN_HOT} opacity={f.stream * 0.55} />
      <g stroke="var(--background)" strokeOpacity={0.6} strokeWidth={0.8}>
        {Array.from({ length: 13 }, (_, i) => (
          <polyline key={i} points={pts([9.6 + i * 0.3, 8.9, 0.01], [9.6 + i * 0.3, 10.1, 0.01])} />
        ))}
      </g>

      {/* under-floor drag conveyor: pit → leg boot */}
      <line x1={pbx} y1={pby} x2={lbx} y2={lby} stroke={CORN} strokeWidth={2} strokeDasharray="3 5" strokeDashoffset={flow} opacity={f.leg} filter={`url(#${ids.glow})`} />

      {/* bins */}
      {bins.map((b, i) => (
        <Bin key={i} {...b} fill={i === 2 ? f.binFill : [0.78, 0.31][i]} active={i === 2 && f.leg > 0.05} gradId={ids.bin} glowId={ids.glow} />
      ))}


      {/* bucket leg + headhouse */}
      <Box x={LEG[0]} y={LEG[1]} z={0} dx={1} dy={1} dz={legTop} mat={M.concrete} />
      <line x1={lgx0} y1={lgy0} x2={lgx1} y2={lgy1} stroke={CORN} strokeWidth={2.2} strokeDasharray="2 6" strokeDashoffset={flow * 1.4} opacity={f.leg} filter={`url(#${ids.glow})`} />
      <Box x={LEG[0] - 0.4} y={LEG[1] - 0.4} z={legTop} dx={1.8} dy={1.8} dz={1.3} mat={M.concrete} />
      {/* headhouse beacon */}
      {(() => {
        const [hx, hy] = P(LEG[0] + 0.5, LEG[1] + 0.5, legTop + 1.6)
        const pulse = 0.55 + 0.45 * Math.sin(t * 3)
        return <circle cx={hx} cy={hy} r={2.4} fill="var(--primary)" opacity={pulse} filter={`url(#${ids.glow})`} />
      })()}
      {/* downspout to the receiving bin */}
      <line x1={spx0} y1={spy0} x2={spx1} y2={spy1} stroke={EDGE} strokeWidth={3} strokeLinecap="round" />
      <line x1={spx0} y1={spy0} x2={spx1} y2={spy1} stroke={CORN} strokeWidth={1.8} strokeDasharray="3 5" strokeDashoffset={flow} opacity={f.leg} filter={`url(#${ids.glow})`} />

      {/* scale house */}
      <Box x={15.6} y={4.6} z={0} dx={2.6} dy={2.2} dz={2.2} mat={M.concrete} />
      <polygon points={pts([16.0, 6.8, 0.9], [17.6, 6.8, 0.9], [17.6, 6.8, 1.7], [16.0, 6.8, 1.7])} fill={CORN_HOT} opacity={0.85} filter={`url(#${ids.glow})`} />
      <Box x={15.4} y={4.4} z={2.2} dx={3.0} dy={2.6} dz={0.18} mat={M.steel} />

      {/* the load */}
      <Truck f={f} ids={ids} />
      <Dust f={f} />
    </>
  )
}

/** Isometric receiving-pit animation: a load of corn dumped at the elevator. */
export function GrainDumpScene({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const uid = React.useId().replace(/:/g, "")
  const ids: Ids = React.useMemo(
    () => ({ glow: `${uid}g`, glowSoft: `${uid}gs`, bin: `${uid}b`, beam: `${uid}hb`, pit: `${uid}p`, rim: `${uid}r`, grid: `${uid}m`, fade: `${uid}f` }),
    [uid],
  )
  const [t, setT] = React.useState(reduce ? 7.2 : 0)
  const [playing, setPlaying] = React.useState(!reduce)
  const [visible, setVisible] = React.useState(true)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (reduce) {
      setPlaying(false)
      setT(7.2)
    }
  }, [reduce])

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (!playing || !visible) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setT((v) => (v + dt) % LOOP)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, visible])

  const f = frame(t)

  return (
    <div ref={ref} className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="relative bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_70%)]">
        <svg viewBox="-300 -150 720 470" className="block h-auto w-full" role="img" aria-label="Isometric illustration: a grain truck pulls onto the receiving pit, dumps corn through the grate, the bucket leg lifts it into a bin, and the truck pulls away.">
          <Scene f={f} ids={ids} t={t} />
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-xs font-semibold">LD-24-0918</span>
          <CommodityBadge commodity="corn" />
          <span className={cn("text-muted-foreground", typeStyles.bodySmall)} aria-live="off">
            {f.phase}
          </span>
        </div>
        <div className="font-mono text-sm font-semibold tabular-nums">
          {f.bu.toLocaleString()} <span className="text-muted-foreground">/ {LOAD_BU.toLocaleString()} bu</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause animation" : "Play animation"}>
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setT(0)
              setPlaying(true)
            }}
            aria-label="Replay from the start"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
