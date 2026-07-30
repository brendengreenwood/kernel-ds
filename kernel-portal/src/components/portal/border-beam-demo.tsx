"use client"

import * as React from "react"
import { Section, Subhead, Demo } from "./section"
import { Button } from "@kernel/ui"
import { Input } from "@kernel/ui"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@kernel/ui"
import { Label } from "@kernel/ui"
import { Switch } from "@kernel/ui"
import type { BorderBeamColorVariant } from "border-beam"

const VARIANTS: BorderBeamColorVariant[] = ["colorful", "ocean", "sunset", "mono"]

export function BorderBeamSection() {
  const [active, setActive] = React.useState(true)

  return (
    <Section
      id="border-beam"
      eyebrow="Effects"
      title="Border beam"
      lead="An opt-in animated glow, exposed as a borderBeam prop on Button, Input, and Card. Pass borderBeam for the control's default beam, or an options object (size · colorVariant · strength · active …) to tune it. Powered by the third-party border-beam package; the beam theme follows light/dark automatically. Purely decorative — reserve it for a single focal action, not a whole screen."
    >
      <div className="mb-8 flex items-center gap-3">
        <Switch id="beam-active" checked={active} onCheckedChange={setActive} />
        <Label htmlFor="beam-active">Animate the beams on this page</Label>
      </div>

      <Subhead id="bb-buttons">Button · <code className="font-mono text-[0.85em]">borderBeam</code></Subhead>
      <Demo className="gap-4">
        <Button borderBeam={{ active }}>Get quote</Button>
        <Button variant="secondary" borderBeam={{ active, colorVariant: "ocean" }}>
          Book load
        </Button>
        <Button variant="outline" borderBeam={{ active, colorVariant: "sunset", size: "pulse-inner" }}>
          Price it
        </Button>
      </Demo>

      <Subhead id="bb-inputs">Input · <code className="font-mono text-[0.85em]">borderBeam</code></Subhead>
      <Demo className="flex-col items-stretch gap-4">
        <Input placeholder="Search farms, contracts, loads…" borderBeam={{ active }} />
        <Input placeholder="Ocean, static color" borderBeam={{ active, colorVariant: "ocean", staticColors: true }} />
      </Demo>

      <Subhead id="bb-cards">Card · <code className="font-mono text-[0.85em]">borderBeam</code></Subhead>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VARIANTS.slice(0, 3).map((v) => (
          <Card key={v} borderBeam={{ active, colorVariant: v }}>
            <CardHeader>
              <CardTitle className="capitalize">{v}</CardTitle>
              <CardDescription>size="md" · full traveling border</CardDescription>
            </CardHeader>
            <CardContent className="font-mono text-xs text-muted-foreground">
              borderBeam={"{{"} colorVariant: "{v}" {"}}"}
            </CardContent>
          </Card>
        ))}
      </div>

      <Subhead id="bb-card-pulse">Card · pulse presets</Subhead>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card borderBeam={{ active, size: "pulse-inner", colorVariant: "ocean" }}>
          <CardHeader>
            <CardTitle>pulse-inner</CardTitle>
            <CardDescription>Contained breathing glow, held inside the border.</CardDescription>
          </CardHeader>
        </Card>
        <Card borderBeam={{ active, size: "pulse-outside", colorVariant: "sunset" }}>
          <CardHeader>
            <CardTitle>pulse-outside</CardTitle>
            <CardDescription>Outward-blooming halo around the card.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Section>
  )
}
