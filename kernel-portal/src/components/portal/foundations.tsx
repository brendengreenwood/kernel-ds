"use client"

import * as React from "react"
import { toast } from "sonner"
import { Section } from "./section"
import { CommodityBadge, type Commodity } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { typeStyles } from "@/lib/type-styles"
import { cn } from "@/lib/utils"

function copy(token: string) {
  navigator.clipboard?.writeText(token)
  toast.success("Copied", { description: token })
}

const STEPS_11 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const STEPS_10 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

function Ramp({
  name,
  role,
  token,
  steps,
}: {
  name: string
  role: string
  token: string
  steps: number[]
}) {
  return (
    <div className="mb-3.5 grid grid-cols-1 items-center gap-3 sm:grid-cols-[132px_1fr] sm:gap-4">
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{role}</div>
      </div>
      <div className="flex overflow-hidden rounded-md border">
        {steps.map((st) => (
          <button
            key={st}
            onClick={() => copy(`var(--${token}-${st})`)}
            className={`flex h-14 min-w-0 flex-1 cursor-copy items-end justify-start p-1.5 max-sm:px-1 font-mono text-[10px] font-semibold ${
              st <= 400 ? "text-neutral-800" : "text-white"
            }`}
            style={{ background: `var(--${token}-${st})` }}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  )
}

const viz = [
  ["crop", "Crop green"],
  ["wheat", "Wheat"],
  ["clay", "Clay"],
  ["sky", "Sky"],
  ["plum", "Plum"],
  ["teal", "Teal"],
  ["rust", "Rust"],
  ["slate", "Slate"],
]

// token key → display label; token is --commodity-<key>-*
const commodities: [string, string][] = [
  ["corn", "Corn"],
  ["canola", "Canola"],
  ["soy", "Soybeans"],
  ["wheat", "Wheat"],
]

const commodityTags: Commodity[] = ["corn", "canola", "soybeans", "wheat"]

// token key ≠ badge key for the two snake_case statuses (in_transit, on_hold)
const statuses: { token: string; badge: Status; source: string }[] = [
  { token: "--status-draft", badge: "draft", source: "neutral-500" },
  { token: "--status-pending", badge: "pending", source: "info-500" },
  { token: "--status-booked", badge: "booked", source: "viz-plum-500" },
  { token: "--status-intransit", badge: "in_transit", source: "warning-500" },
  { token: "--status-delivered", badge: "delivered", source: "viz-teal-500" },
  { token: "--status-settled", badge: "settled", source: "success-500" },
  { token: "--status-onhold", badge: "on_hold", source: "viz-clay-500" },
  { token: "--status-rejected", badge: "rejected", source: "error-500" },
  { token: "--status-cancelled", badge: "cancelled", source: "viz-slate-500" },
  { token: "--status-expired", badge: "expired", source: "viz-rust-500" },
]

type RolePair = { name: string; v: string; fg: string; map?: string; desc?: string }
type RoleSwatch = { name: string; v: string; desc: string }

const interactivePairs: RolePair[] = [
  { name: "Primary", v: "--primary", fg: "--primary-foreground", map: "brand-600 / brand-300" },
  { name: "Secondary", v: "--secondary", fg: "--secondary-foreground", map: "brand-50 / neutral-800" },
  { name: "Accent", v: "--accent", fg: "--accent-foreground", map: "brand-300" },
  { name: "Destructive", v: "--destructive", fg: "--destructive-foreground", map: "error-500 / error-400" },
]

const surfacePairs: RolePair[] = [
  { name: "Background", v: "--background", fg: "--foreground", desc: "Page canvas and default ink" },
  { name: "Card", v: "--card", fg: "--card-foreground", desc: "Raised surfaces — cards, tables, panels" },
  { name: "Popover", v: "--popover", fg: "--popover-foreground", desc: "Floating layers — menus, dialogs, tooltips" },
  { name: "Muted", v: "--muted", fg: "--muted-foreground", desc: "Recessed fills and de-emphasized ink" },
]

const chromeSwatches: RoleSwatch[] = [
  { name: "Border", v: "--border", desc: "Hairlines — dividers, card edges" },
  { name: "Input", v: "--input", desc: "Form-control borders (darker than --border for affordance)" },
  { name: "Ring", v: "--ring", desc: "Focus indicator — tracks --primary" },
]

const sidebarPairs: RolePair[] = [
  { name: "Sidebar", v: "--sidebar", fg: "--sidebar-foreground", desc: "Rail canvas and ink" },
  { name: "Sidebar primary", v: "--sidebar-primary", fg: "--sidebar-primary-foreground", desc: "Active nav item" },
  { name: "Sidebar accent", v: "--sidebar-accent", fg: "--sidebar-accent-foreground", desc: "Hover and selected fills" },
]

const sidebarSwatches: RoleSwatch[] = [
  { name: "Sidebar border", v: "--sidebar-border", desc: "Rail hairlines" },
  { name: "Sidebar ring", v: "--sidebar-ring", desc: "Rail focus indicator" },
]

function PairCard({ p }: { p: RolePair }) {
  return (
    <button
      onClick={() => copy(`var(${p.v})`)}
      className="flex items-center gap-4 rounded-md border bg-card p-3 text-left transition-shadow hover:shadow-md"
    >
      <div
        className="grid h-11 w-24 shrink-0 place-items-center rounded-sm border text-sm font-semibold"
        style={{ background: `var(${p.v})`, color: `var(${p.fg})` }}
      >
        Aa
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{p.name}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">
          {p.v}
          {p.map ? ` → ${p.map}` : ""}
        </div>
        {p.desc ? (
          <div className="truncate text-xs text-muted-foreground">{p.desc}</div>
        ) : null}
      </div>
    </button>
  )
}

function SwatchCard({ s }: { s: RoleSwatch }) {
  return (
    <button
      onClick={() => copy(`var(${s.v})`)}
      className="flex items-center gap-4 rounded-md border bg-card p-3 text-left transition-shadow hover:shadow-md"
    >
      <div
        className="h-11 w-24 shrink-0 rounded-sm border"
        style={{ background: `var(${s.v})` }}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{s.name}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">{s.v}</div>
        <div className="truncate text-xs text-muted-foreground">{s.desc}</div>
      </div>
    </button>
  )
}

export function ColorsSection() {
  return (
    <Section
      id="colors"
      eyebrow="Foundations"
      title="Color"
      lead="The palette is built in two layers. Scales are the absolute, mode-independent ink — 50→950 ramps (the four notification scales run 50→900), available as bg-brand-500, text-success-700, and so on. Role tokens (primary, background…) point at a scale step and remap per mode."
    >
      <h4 className={cn("mb-4", typeStyles.overline)}>
        Brand & neutral scales
      </h4>
      <div className="rounded-lg border bg-card p-8">
        <Ramp name="Brand" role="green · brand-*" token="brand" steps={STEPS_11} />
        <Ramp name="Neutral" role="green-tinted · neutral-*" token="neutral" steps={STEPS_11} />
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Notification scales
      </h4>
      <div className="rounded-lg border bg-card p-8">
        <Ramp name="Success" role="emerald · success-*" token="success" steps={STEPS_10} />
        <Ramp name="Warning" role="wheat · warning-*" token="warning" steps={STEPS_10} />
        <Ramp name="Error" role="red · error-*" token="error" steps={STEPS_10} />
        <Ramp name="Info" role="blue · info-*" token="info" steps={STEPS_10} />
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Data visualization
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A categorical palette separate from brand and notification colors, so a
        chart series never reads as a status. Each hue is a full 50–950 scale;
        the <code className="font-mono">-light</code> / <code className="font-mono">-dark</code>{" "}
        aliases point at steps 200 / 700.
      </p>
      <div className="rounded-lg border bg-card p-8">
        {viz.map(([k, n]) => (
          <Ramp key={k} name={n} role={`--viz-${k}-*`} token={`viz-${k}`} steps={STEPS_11} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Commodity coding
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A fixed hue per grain commodity (decision 0013) so tags, badges, and
        chips are scannable at a glance — corn gold, canola yellow, soybean
        green, wheat tan. A categorical system like data-viz, but semantic:
        the hue <em>means</em> the commodity. Use{" "}
        <code className="font-mono">&lt;CommodityBadge&gt;</code> for tags;
        drive charts from the same <code className="font-mono">--commodity-*</code>{" "}
        tokens.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {commodityTags.map((c) => (
            <CommodityBadge key={c} commodity={c} />
          ))}
        </div>
        {commodities.map(([k, n]) => (
          <Ramp key={k} name={n} role={`--commodity-${k}-*`} token={`commodity-${k}`} steps={STEPS_11} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Status coding
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The third color axis (decision 0003): a status is the{" "}
        <em>persistent lifecycle state</em> a load or contract sits in —
        distinct from notifications, which signal a momentary event outcome.
        Each <code className="font-mono">--status-*</code> token aliases a
        distinct hue&apos;s 500 step so a column of statuses stays scannable;{" "}
        <code className="font-mono">&lt;StatusBadge&gt;</code> derives its dot
        and soft fill from the same hue.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statuses.map((s) => (
          <button
            key={s.token}
            onClick={() => copy(`var(${s.token})`)}
            className="flex items-center gap-4 rounded-md border bg-card p-3 text-left transition-shadow hover:shadow-md"
          >
            <div
              className="h-11 w-24 shrink-0 rounded-sm border"
              style={{ background: `var(${s.token})` }}
            />
            <div className="min-w-0">
              <StatusBadge status={s.badge} />
              <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {s.token} → {s.source}
              </div>
            </div>
          </button>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Role tokens — interactive pairs
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The semantic layer the components actually consume — every shadcn role
        token, each remapping between light and dark. Pairs render their{" "}
        <code className="font-mono">-foreground</code> ink on their fill, so a
        card is also a live contrast check.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {interactivePairs.map((p) => (
          <PairCard key={p.v} p={p} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Role tokens — surfaces & ink
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {surfacePairs.map((p) => (
          <PairCard key={p.v} p={p} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Role tokens — borders & focus
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {chromeSwatches.map((s) => (
          <SwatchCard key={s.v} s={s} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Role tokens — sidebar
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The navigation rail carries its own token family so it can diverge from
        the page surface (e.g. stay dark in a light app) without touching the
        global roles.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sidebarPairs.map((p) => (
          <PairCard key={p.v} p={p} />
        ))}
        {sidebarSwatches.map((s) => (
          <SwatchCard key={s.v} s={s} />
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Role tokens — chart slots
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        shadcn&apos;s five default chart slots, filled with a single-hue brand
        ramp so out-of-the-box chart components stay on brand. For real
        multi-series work use the data-viz palette above —{" "}
        <code className="font-mono">--viz-*</code> stays abstract so a series
        never reads as a status.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <div className="flex overflow-hidden rounded-md border">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => copy(`var(--chart-${i})`)}
              className="min-w-0 flex-1 cursor-copy"
            >
              <div
                className="h-14"
                style={{ background: `var(--chart-${i})` }}
              />
              <div className="border-t bg-card p-1.5 text-center font-mono text-[10px] font-semibold text-muted-foreground">
                chart-{i}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function TypographySection() {
  const families = [
    { name: "System sans-serif", role: "--font-sans · UI, body & numbers", cls: "font-sans" },
    { name: "System monospace", role: "--font-mono · Code & data", cls: "font-mono" },
  ]
  const sizes = [
    ["text-2xs", "text-2xs", "11px · 16px · +0.005em", "tracking-[0.005em]"],
    ["text-xs", "text-xs", "12px · 16px", ""],
    ["text-sm", "text-sm", "14px · 20px", ""],
    ["text-base", "text-base", "16px · 24px", ""],
    ["text-lg", "text-lg", "18px · 28px · −0.005em", "tracking-[-0.005em]"],
    ["text-xl", "text-xl", "20px · 28px · −0.01em", "tracking-[-0.01em]"],
    ["text-2xl", "text-2xl", "24px · 32px · −0.015em", "tracking-[-0.015em]"],
    ["text-3xl", "text-3xl", "30px · 36px · −0.02em", "font-semibold tracking-[-0.02em]"],
    ["text-4xl", "text-4xl", "36px · 40px · −0.022em", "font-semibold tracking-[-0.022em]"],
    ["text-5xl", "text-5xl", "48px · 1 · −0.025em", "font-semibold tracking-[-0.025em]"],
    ["text-6xl", "text-6xl", "60px · 1 · −0.03em", "font-semibold tracking-[-0.03em]"],
    ["text-7xl", "text-7xl", "72px · 1 · −0.03em", "font-semibold tracking-[-0.03em]"],
  ] as const
  // Rendered from the same `typeStyles` source the portal chrome consumes,
  // so the specimen can't drift from what the app actually uses (dogfooding).
  const styles: [string, string, string, string][] = [
    ["Display", "text-5xl · 600 · −0.025em", typeStyles.display, "412 loads settled"],
    ["Page title", "text-3xl · 600 · −0.02em", typeStyles.pageTitle, "Open contracts"],
    ["Section title", "text-2xl · 600 · −0.015em", typeStyles.sectionTitle, "Today's cash bids"],
    ["Card title", "text-lg · 600 · −0.01em", typeStyles.cardTitle, "River terminal"],
    ["Body", "text-base · 400", cn(typeStyles.body, "max-w-[52ch]"), "Merchants compare local basis, lock a price, and settle the load — all from one screen."],
    ["Body small · default UI", "text-sm · 400", cn(typeStyles.bodySmall, "max-w-[54ch]"), "The default size for most controls, table cells, and dense layouts."],
    ["Label", "text-sm · 500", typeStyles.label, "Delivery window"],
    ["Caption", "text-xs · 400 · muted", typeStyles.caption, "Updated 12 minutes ago"],
    ["Overline", "text-2xs · 600 · +0.13em · caps", typeStyles.overline, "Settlement"],
    ["Numeric", "text-sm · mono · tabular-nums", typeStyles.numeric, "$4.62 / bu   18,400 bu"],
    ["Code", "text-sm · mono", typeStyles.code, 'contract.status === "settled"'],
  ]
  const weights = [
    ["Regular", "400", "font-normal"],
    ["Medium", "500", "font-medium"],
    ["Semibold", "600", "font-semibold"],
    ["Bold", "700", "font-bold"],
  ] as const
  return (
    <Section
      id="typography"
      eyebrow="Foundations"
      title="Typography"
      lead="No web fonts, by design — the system renders in each OS's native UI typeface (San Francisco, Segoe UI, Roboto), with a monospace stack for code, IDs, and tabular data. Zero network requests, instant paint, native everywhere. The size ramp runs from dense table meta to display."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {families.map((f) => (
          <div key={f.name} className="rounded-lg border bg-card p-6">
            <div className={`${f.cls} text-5xl leading-none tracking-tight`}>Ag</div>
            <div className="mt-3 text-sm text-muted-foreground">
              ABCDEFG abcdefg 0123456789
            </div>
            <div className="mt-4 text-sm font-semibold">{f.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{f.role}</div>
          </div>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Size scale
      </h4>
      <div className="rounded-lg border bg-card p-8">
        {sizes.map(([token, sizeCls, meta, extra]) => (
          <div
            key={token}
            className="grid grid-cols-[64px_1fr] items-baseline gap-5 border-b py-3 last:border-b-0 sm:grid-cols-[64px_1fr_176px]"
          >
            <div className="font-mono text-xs font-semibold">{token}</div>
            <div className={`truncate ${sizeCls} ${extra}`}>
              Grain pricing &amp; settlement
            </div>
            <div className="hidden text-right font-mono text-[11px] text-muted-foreground sm:block">
              {meta}
            </div>
          </div>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Semantic text styles
      </h4>
      <div className="rounded-lg border bg-card p-8">
        {styles.map(([name, map, cls, text]) => (
          <div
            key={name}
            className="grid grid-cols-1 gap-2 border-b py-4 last:border-b-0 sm:grid-cols-[172px_minmax(0,1fr)] sm:items-baseline sm:gap-6"
          >
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{map}</div>
            </div>
            <div className={cls}>{text}</div>
          </div>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Weights & numerals
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {weights.map(([name, num, cls]) => (
            <div key={num} className="rounded-md border bg-card p-[18px]">
              <div className={`text-4xl leading-none tracking-tight ${cls}`}>Ag</div>
              <div className="mt-3 text-sm font-semibold">{name}</div>
              <div className="font-mono text-xs text-muted-foreground">{num}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-8">
          <div className="mb-3 text-sm font-semibold">Tabular numerals</div>
          <table className="w-full font-mono text-sm tabular-nums">
            <tbody>
              {[
                ["Corn · river", "$4.62"],
                ["Soybean · north", "$11.08"],
                ["Wheat · rail", "$5.94"],
                ["Open position", "18,400 bu"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b last:border-b-0">
                  <td className="py-1.5">{k}</td>
                  <td className="py-1.5 text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2.5 text-[11px] leading-snug text-muted-foreground">
            Columns align because <span className="font-mono">tabular-nums</span> gives
            every digit the same width.
          </div>
        </div>
      </div>
    </Section>
  )
}

export function SpacingSection() {
  const spacing = [
    ["1", "0.24rem", 4],
    ["2", "0.48rem", 8],
    ["3", "0.72rem", 12],
    ["4", "0.96rem", 16],
    ["6", "1.44rem", 24],
    ["8", "1.92rem", 32],
    ["12", "2.88rem", 48],
    ["16", "3.84rem", 64],
  ] as const
  const radii = [
    ["sm", "rounded-sm", "r − 4px"],
    ["md", "rounded-md", "r − 2px"],
    ["lg", "rounded-lg", "0.5rem"],
    ["xl", "rounded-xl", "r + 4px"],
    ["full", "rounded-full", "999px"],
  ] as const
  const controls = [
    ["--control-h-sm", "sm", "32px", "40px", "compact toolbars, dense rows"],
    ["--control-h", "default", "38px", "44px", "the resting default"],
    ["--control-h-lg", "lg", "44px", "48px", "hero actions; the touch minimum"],
  ] as const
  return (
    <Section
      id="spacing"
      eyebrow="Foundations"
      title="Spacing & radius"
      lead="Spacing derives from a --spacing base of 0.24rem; corner radius flows from a single --radius of 0.5rem. Control heights come from their own density tokens (decision 0010)."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-8">
          <div className="text-sm font-semibold">Spacing scale</div>
          <div className="mb-4 font-mono text-xs text-muted-foreground">
            base --spacing = 0.24rem
          </div>
          {spacing.map(([n, rem, px]) => (
            <div key={n} className="flex items-center gap-4 border-b py-2.5 last:border-b-0">
              <span className="w-8 font-mono text-sm font-semibold">{n}</span>
              <span className="w-24 font-mono text-xs text-muted-foreground">{rem}</span>
              <span className="h-[18px] rounded-sm bg-primary" style={{ width: px }} />
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-8">
          <div className="text-sm font-semibold">Radius scale</div>
          <div className="mb-4 font-mono text-xs text-muted-foreground">
            base --radius = 0.5rem
          </div>
          <div className="grid grid-cols-2 gap-4">
            {radii.map(([name, cls, sub]) => (
              <div key={name} className="rounded-md border bg-card p-4 text-center">
                <div className={`mb-3 h-16 border border-primary bg-primary/15 ${cls}`} />
                <div className="font-mono text-sm font-semibold">{name}</div>
                <div className="font-mono text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Control density
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Buttons, inputs, and select triggers all reference the{" "}
        <code className="font-mono">--control-h-*</code> tokens — never a
        hardcoded height (decision 0010). On coarse pointers the tokens
        themselves grow to 40 / 44 / 48px, so every control meets the touch
        minimum without per-component overrides. The bars below render from the
        live tokens.
      </p>
      <div className="rounded-lg border bg-card p-8">
        {controls.map(([token, size, fine, coarse, use]) => (
          <div
            key={token}
            className="grid grid-cols-1 items-center gap-3 border-b py-3 last:border-b-0 sm:grid-cols-[172px_minmax(0,1fr)] sm:gap-4"
          >
            <div>
              <div className="font-mono text-sm font-semibold">{token}</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {size} · {fine} → {coarse} coarse
              </div>
            </div>
            <div className="min-w-0">
              <div
                className="flex max-w-72 items-center rounded-md border border-primary bg-primary/15 px-3 text-xs text-muted-foreground"
                style={{ height: `var(${token})` }}
              >
                {use}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function ShadowsSection() {
  const shadows = [
    "shadow-2xs",
    "shadow-xs",
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
  ]
  return (
    <Section
      id="shadows"
      eyebrow="Foundations"
      title="Elevation"
      lead="A restrained, soft shadow ramp. Black at low opacity keeps elevation subtle in light mode and unobtrusive in dark."
    >
      <div className="rounded-lg border bg-card p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {shadows.map((s) => (
            <div key={s} className="text-center">
              <div className={`mb-3 h-24 rounded-md border bg-card ${s}`} />
              <div className="font-mono text-xs font-semibold">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
