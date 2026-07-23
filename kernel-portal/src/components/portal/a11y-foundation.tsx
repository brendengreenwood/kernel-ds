"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Section } from "./section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { typeStyles } from "@/lib/type-styles"
import { cn } from "@/lib/utils"

/**
 * Accessibility foundation: the contract the audits enforce, stated
 * user-facing. Sources: decisions 0003/0007/0009/0018, the contrast and
 * mobile audit scripts, and the per-component reviews in docs/a11y/.
 */

/** A small control shown against its dashed 44×44 effective target. */
function TargetDemo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="relative grid size-14 place-items-center">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-md border border-dashed border-primary/50"
        />
        {children}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

export function AccessibilitySection() {
  return (
    <Section
      id="accessibility"
      eyebrow="Foundations"
      title="Accessibility"
      lead="Accessibility here is a contract, not a checklist run once: touch targets, focus, contrast, text zoom, and motion each have a stated rule and a repeatable audit that enforces it. Every component has passed a per-component review (68/68, reports in docs/a11y/)."
    >
      <h4 className={cn("mb-4", typeStyles.overline)}>Touch targets</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        On coarse pointers every interactive element offers a ≥44px target
        (decisions 0007 + 0009), by one of two mechanisms: primary controls{" "}
        <em>visibly grow</em> — the <code className="font-mono">--control-h-*</code>{" "}
        tokens themselves redefine to 40/44/48px — while deliberately-small
        controls (checkbox, radio, switch, kebab menus, dense chips) keep
        their size and gain an <em>invisible hit extension</em> via a
        pseudo-element. The dashed outline below marks the effective target;
        on a phone, the tap area is the outline, not the control.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-wrap items-end gap-8">
          <TargetDemo label="checkbox">
            <Checkbox aria-label="Touch target demo checkbox" defaultChecked />
          </TargetDemo>
          <TargetDemo label="switch">
            <Switch aria-label="Touch target demo switch" defaultChecked />
          </TargetDemo>
          <div className="flex flex-col items-center gap-2">
            <Button size="sm">Book load</Button>
            <span className="font-mono text-[11px] text-muted-foreground">
              grows via token
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          New controls pick one of the two mechanisms and join the{" "}
          <code className="font-mono">@media (pointer: coarse)</code> block at
          the end of <code className="font-mono">index.css</code>.{" "}
          <code className="font-mono">scripts/mobile-audit.mjs</code> measures
          effective hit areas at 390px.
        </p>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Focus visibility</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Everything gets a visible focus indicator for free: a global rule
        applies <code className="font-mono">outline-ring/50</code> to every
        element, and controls layer a 3px{" "}
        <code className="font-mono">ring-ring</code> treatment on{" "}
        <code className="font-mono">focus-visible</code> — keyboard focus is
        never styled away. The ring color tracks{" "}
        <code className="font-mono">--ring</code> (see the Color page), so it
        holds contrast in both modes.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Tab through this row — each stop shows the ring:
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Post bid</Button>
          <Button variant="outline">Cancel</Button>
          <Input
            aria-label="Focus demo input"
            placeholder="Basis, e.g. -0.35"
            className="max-w-44"
          />
          <Checkbox aria-label="Focus demo checkbox" />
        </div>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Contrast</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Every rendered text/background pair passes WCAG AA 4.5:1 in both
        modes — including the soft-fill badge and alert variants, which are
        the pairs that usually fail quietly.{" "}
        <code className="font-mono">scripts/contrast-audit.mjs</code> checks
        70+ pairs light + dark on every token change; failures are fixed in
        the token layer (L nudges), never by special-casing a component.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="settled" />
          <StatusBadge status="in_transit" />
          <StatusBadge status="rejected" />
          <Badge variant="success">Priced</Badge>
          <Badge variant="warning">Basis moved</Badge>
          <Badge variant="info">New bid</Badge>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Audited pairs, not approximations — each of these fills is in the
          contrast report.
        </p>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Text & zoom</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Text inputs never render below 16px on phones{" "}
        (<code className="font-mono">text-base md:text-sm</code>) — under
        16px, iOS zooms the page on focus and doesn&apos;t zoom back. This is
        deliberate; don&apos;t &quot;fix&quot; an input back to the 14px type
        scale. The mobile audit flags any control that slips under the floor.
      </p>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Motion</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A global <code className="font-mono">prefers-reduced-motion</code>{" "}
        guard near-zeros every animation and transition — new motion inherits
        it for free, so accessibility is never opt-in. Details on the{" "}
        <Link to="/motion" className="underline underline-offset-2 hover:text-foreground">
          Motion page
        </Link>
        .
      </p>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Review process</h4>
      <p className="-mt-2 max-w-2xl text-sm text-muted-foreground">
        Every component passes a per-component accessibility review before
        promotion to <em>ready</em> (68/68 reviewed; reports live in{" "}
        <code className="font-mono">docs/a11y/</code>). Known trade-offs are
        disclosed as watch items rather than silently accepted — e.g. Calendar
        day cells are 27px at 390px: past WCAG 2.5.8 AA (≥24px), below the
        project&apos;s 44px bar, accepted for grid density.
      </p>
    </Section>
  )
}
