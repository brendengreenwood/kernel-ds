"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Plus, X, ChevronDown } from "@/components/ui/icon"

import { cn } from "@/lib/utils"
import { Section, Subhead } from "./section"
import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { autoAnimateConfig } from "@/lib/motion"

/** A track whose dot travels on click, timed by a duration + easing token. */
function Track({ token, meta, duration, easing }: { token: string; meta: string; duration: string; easing: string }) {
  const [on, setOn] = React.useState(false)
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-semibold">{token}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{meta}</span>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        aria-label={`Replay ${token}`}
        className="relative block h-9 w-full overflow-hidden rounded-md border bg-muted/40"
      >
        <span
          className="absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: on ? "calc(100% - 24px)" : "4px", transition: `left ${duration} ${easing}` }}
        />
      </button>
    </div>
  )
}

const PortalOnly = () => (
  <span className="rounded-sm border border-warning-300 px-1 py-px font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-warning-800 dark:border-warning-800/60 dark:text-warning-200">
    portal-only
  </span>
)

function NumbersDemo() {
  const [v, setV] = React.useState(4.62)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="font-mono text-3xl font-semibold tabular-nums">
        <AnimatedNumber value={v} prefix="$" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        <span className="text-base text-muted-foreground"> / bu</span>
      </div>
      <Button size="sm" variant="outline" onClick={() => setV(4 + Math.round(Math.random() * 800) / 100)}>
        New bid
      </Button>
    </div>
  )
}

function ListDemo() {
  const [items, setItems] = React.useState(["Corn", "Soybeans", "Wheat"])
  const pool = ["Canola", "Sorghum", "Barley", "Oats"]
  const [ref] = useAutoAnimate<HTMLDivElement>(autoAnimateConfig)
  return (
    <div className="w-full max-w-xs">
      <div ref={ref} className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div key={it} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
            {it}
            <button aria-label={`Remove ${it}`} onClick={() => setItems((p) => p.filter((x) => x !== it))} className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="mt-2 text-muted-foreground"
        onClick={() => setItems((p) => { const n = pool.find((x) => !p.includes(x)); return n ? [...p, n] : p })}
      >
        <Plus /> Add grain
      </Button>
    </div>
  )
}

function PresenceDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="w-full max-w-sm">
      <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
        <ChevronDown className={cn("transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)]", open && "rotate-180")} />
        {open ? "Hide terms" : "Show terms"}
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-md border bg-card p-3 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                <span>Futures (ZCZ6)</span><span className="text-right text-foreground">$4.38</span>
                <span>Basis</span><span className="text-right text-foreground">−0.22</span>
                <span>Cash</span><span className="text-right font-semibold text-foreground">$4.16</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MotionSection() {
  return (
    <Section
      id="motion"
      eyebrow="Foundations"
      title="Motion"
      lead="One source for timing and easing (decision 0018) so polish stays consistent and tunable — animate with the tokens, never ad-hoc ms or curves. All motion honors prefers-reduced-motion. Richer engines (animated numbers, list transitions, enter/exit) are opt-in npm libraries, portal-only."
    >
      <Subhead>Duration — how long</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Three steps. Faster for small state flips, slower for enter/exit and layout. Click a track to replay.
      </p>
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-6 sm:grid-cols-3">
        <Track token="--duration-fast" meta="120ms" duration="var(--duration-fast)" easing="var(--ease-out)" />
        <Track token="--duration-base" meta="200ms" duration="var(--duration-base)" easing="var(--ease-out)" />
        <Track token="--duration-slow" meta="320ms" duration="var(--duration-slow)" easing="var(--ease-out)" />
      </div>

      <Subhead>Easing — the curve</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Decelerate for most UI, symmetric for moves, a little overshoot for playful affordances. Same duration, different feel.
      </p>
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-6 sm:grid-cols-3">
        <Track token="--ease-out" meta="most UI" duration="var(--duration-slow)" easing="var(--ease-out)" />
        <Track token="--ease-in-out" meta="symmetric" duration="var(--duration-slow)" easing="var(--ease-in-out)" />
        <Track token="--ease-spring" meta="overshoot" duration="var(--duration-slow)" easing="var(--ease-spring)" />
      </div>

      <Subhead>Reduced motion</Subhead>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Both surfaces carry a <code className="font-mono">@media (prefers-reduced-motion: reduce)</code> guard that
        near-zeros durations everywhere, and the React engines below honor the OS setting natively. New motion inherits
        the guard for free — you never opt in to accessibility.
      </div>

      <Subhead>Polish primitives &nbsp;<PortalOnly /></Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Opt-in engines wired to the same tokens: animated numerics (<code className="font-mono">@number-flow/react</code>),
        list transitions (<code className="font-mono">@formkit/auto-animate</code>), and enter/exit + layout
        (<code className="font-mono">motion</code>). React-only, so the static preview shows their content without motion.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Animated number</div>
          <NumbersDemo />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">List transition</div>
          <ListDemo />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Enter / exit</div>
          <PresenceDemo />
        </div>
      </div>
    </Section>
  )
}
