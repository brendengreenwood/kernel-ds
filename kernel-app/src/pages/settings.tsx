import * as React from "react"
import { Bell, Settings as SettingsGlyph, Users } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PageHeader, PanelHeader } from "@app/components/panels"
import { locations } from "@app/data/scenarios"

/** One notification preference row: label + explanation, switch at the end. */
function PrefRow({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string
  label: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

export default function SettingsPage() {
  const [org, setOrg] = React.useState("Rivergrain Co.")
  const [home, setHome] = React.useState(locations[0])
  const elevatorItems = Object.fromEntries(locations.map((l) => [l, l]))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-8">
      <PageHeader icon={SettingsGlyph} title="Settings" />

      <Card>
        <PanelHeader
          icon={Users}
          title="Organization"
          description="Who you are, and where your grain goes by default"
        />
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="home-elevator">Home elevator</Label>
            <Select value={home} onValueChange={(v) => setHome(v as string)} items={elevatorItems}>
              {/* text-base md:text-sm per decision 0009 — the DS SelectTrigger
                  is text-sm at every width, which trips the phone minimum. */}
              <SelectTrigger id="home-elevator" className="text-base md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              New scenarios default to this delivery location.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm">Save changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <PanelHeader
          icon={Bell}
          title="Notifications"
          description="What lands in your inbox as it happens"
        />
        <CardContent className="flex flex-col divide-y divide-border">
          <PrefRow
            id="pref-accepts"
            label="Producer accepts"
            description="A producer takes one of your posted bids"
            defaultChecked
          />
          <PrefRow
            id="pref-rejects"
            label="Producer rejects"
            description="A producer passes on a bid — worth a look at the level"
            defaultChecked
          />
          <PrefRow
            id="pref-digest"
            label="Morning digest"
            description="One summary of the book at 6am instead of a stream"
          />
        </CardContent>
      </Card>
    </div>
  )
}
