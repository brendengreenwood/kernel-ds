import type maplibregl from "maplibre-gl"
import { cssVarColor } from "@app/lib/color"

const isDark = () => document.documentElement.classList.contains("dark")

/* One map recipe, two themes. Dark ranks importance by moving AWAY from the
   card ground toward light; light mirrors it by moving away toward dark: the
   sky/rust steps flip around the middle of each ramp (400 <-> 600, 700 <-> 300). */
export function mapPalette() {
  const dark = document.documentElement.classList.contains("dark")
  const v = (d: string, l: string) => cssVarColor(dark ? d : l)
  return {
    ground: v("--card", "--cream-50"),
    water: cssVarColor("--om-water"),
    roads: v("--neutral-950", "--cream-300"),
    trunk: v("--viz-sky-400", "--viz-sky-600"),
    tributary: v("--viz-sky-700", "--viz-sky-400"),
    rivers: v("--viz-sky-800", "--viz-sky-300"),
    streams: v("--viz-sky-900", "--viz-sky-200"),
    rail: cssVarColor("--viz-rust-500"),
    flow: [v("--viz-rust-600", "--viz-rust-400"), v("--viz-rust-500", "--viz-rust-500"), v("--viz-rust-400", "--viz-rust-600")],
    label: v("--muted-foreground", "--foreground"),
  }
}

/* Mark roles. Every color a mark uses comes from here, named by what it means.
   Hue ledger and rules: MAP-DESIGN-SYSTEM.md. */
export function markRoles() {
  const dark = isDark()
  const ink = cssVarColor("--foreground")
  // Outline in the page color plus a soft drop shadow lifts marks off the map (white in light, neutral-700 in dark).
  const halo = dark ? cssVarColor("--neutral-700") : "#ffffff"
  const company = ["match", ["get", "co"], "C", cssVarColor("--om-cargill"), cssVarColor("--om-adm")] as unknown as maplibregl.ExpressionSpecification
  const category = ["match", ["get", "kind"], "f", cssVarColor("--om-feed"), "e", cssVarColor("--om-refinery"), cssVarColor("--om-port")] as unknown as maplibregl.ExpressionSpecification
  return {
    dark,
    ink,
    halo,
    /** Ring on a hovered or selected buying point. */
    haloActive: dark ? cssVarColor("--neutral-600") : ink,
    haloHover: dark ? cssVarColor("--neutral-600") : halo,
    /** Fill that makes a mark read as hollow. */
    hollow: dark ? cssVarColor("--neutral-800") : "#ffffff",
    shade: (dark ? [0, 0, 0, 0.7] : [40, 30, 15, 0.45]) as [number, number, number, number],
    company,
    category,
  }
}
