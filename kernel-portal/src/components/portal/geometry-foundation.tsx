"use client"

import * as React from "react"
import { PanelGroup, PanelRegion, PanelShell } from "@kernel/ui"
import { cn } from "@kernel/ui/utils"
import { typeStyles } from "@/lib/type-styles"
import { Section } from "./section"

type GeometryValues = {
  control: number
  surface: number
  floating: number
  modal: number
}

const initialValues: GeometryValues = {
  control: 4,
  surface: 8,
  floating: 8,
  modal: 8,
}

const roles = [
  ["Control", "--radius-control", "Buttons, inputs, selects, toggles", "control"],
  ["Surface", "--radius-surface", "Panels, tables, tiles, alerts", "surface"],
  ["Floating", "--radius-floating", "Menus, popovers, tooltips, command palettes", "floating"],
  ["Modal", "--radius-modal", "Dialogs and blocking overlays", "modal"],
] as const

export function GeometrySection() {
  const [values, setValues] = React.useState(initialValues)
  const previewStyle = {
    "--radius-control": `${values.control}px`,
    "--radius-surface": `${values.surface}px`,
    "--radius-floating": `${values.floating}px`,
    "--radius-modal": `${values.modal}px`,
    "--panel-radius": `${values.surface}px`,
  } as React.CSSProperties

  return (
    <Section
      id="geometry"
      eyebrow="Foundations"
      title="Geometry"
      lead="Geometry is controlled by semantic role tokens, not one global softness dial. Change a role once and every primitive assigned to that role follows it. Connected regions are the exception: the outer shell owns the radius and interior seams stay square."
    >
      <div style={previewStyle} className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-surface)] border bg-card p-6">
            <h2 className="text-base font-semibold">Role levers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These controls preview the same CSS variables consumed by the component library. Defaults are the canonical values.
            </p>
            <div className="mt-6 space-y-5">
              {roles.map(([label, token, usage, key]) => (
                <label key={token} className="grid gap-2">
                  <span className="flex items-baseline justify-between gap-4">
                    <span>
                      <span className="text-sm font-medium">{label}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{token}</span>
                    </span>
                    <span className="font-mono text-sm font-semibold">{values[key]}px</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={values[key]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [key]: Number(event.target.value),
                      }))
                    }
                    aria-label={`${label} radius`}
                    className="accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">{usage}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setValues(initialValues)}
              className="mt-6 rounded-[var(--radius-control)] border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Reset canonical values
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map(([label, token, usage]) => (
              <div
                key={token}
                className="border bg-card p-5"
                style={{ borderRadius: `var(${token})` }}
              >
                <div className={cn(typeStyles.overline, "text-muted-foreground")}>{label}</div>
                <div className="mt-8 font-mono text-sm font-semibold">{token}</div>
                <p className="mt-1 text-xs text-muted-foreground">{usage}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold">Connected composition</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            The 8px surface lever rounds the exposed perimeter once. Toolbar, navigator, canvas, and dock remain square where they meet, so the workspace reads as one tool instead of four adjacent cards.
          </p>
          <PanelShell className="mt-4 grid h-80 grid-rows-[48px_1fr]">
            <PanelRegion className="flex items-center border-b px-4 text-sm font-medium">
              Origination workspace
            </PanelRegion>
            <PanelGroup>
              <PanelRegion className="w-56 p-4 text-sm text-muted-foreground">Navigator</PanelRegion>
              <PanelRegion className="flex-1 p-4 text-sm text-muted-foreground">Canvas</PanelRegion>
              <PanelRegion className="w-56 p-4 text-sm text-muted-foreground">Dock</PanelRegion>
            </PanelGroup>
          </PanelShell>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-none border bg-card p-5">
            <div className="font-mono text-sm font-semibold">0px · connected region</div>
            <p className="mt-1 text-xs text-muted-foreground">Interior seams and regions inside a shared shell.</p>
          </div>
          <div className="rounded-full border bg-card p-5">
            <div className="font-mono text-sm font-semibold">full · capsule</div>
            <p className="mt-1 text-xs text-muted-foreground">Status badges, avatars, and intentional pills only.</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="font-mono text-sm font-semibold">legacy · --radius</div>
            <p className="mt-1 text-xs text-muted-foreground">Temporary fallback for primitives not yet assigned a role.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
