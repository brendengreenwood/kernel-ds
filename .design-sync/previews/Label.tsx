import * as React from "react"
import { Checkbox, Input, Label } from "kernel-portal"

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="farm">Farm name</Label>
      <Input id="farm" placeholder="Hartmann Farms" />
    </div>
  )
}

export function Required() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="price">
        Cash price ($/bu)
        <span style={{ color: "var(--destructive)" }}>*</span>
      </Label>
      <Input id="price" defaultValue="4.62" />
    </div>
  )
}

export function WrappingControl() {
  return (
    <Label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400 }}>
      <Checkbox defaultChecked /> Apply drying charge to settlement
    </Label>
  )
}
