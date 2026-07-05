import * as React from "react"
import { Label, Switch } from "kernel-portal"

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 400,
}

export function Default() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Label style={rowStyle}>
        <Switch defaultChecked /> Price alerts
      </Label>
      <Label style={rowStyle}>
        <Switch /> Auto-roll expiring offers
      </Label>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Label style={rowStyle}>
        <Switch /> Off
      </Label>
      <Label style={rowStyle}>
        <Switch defaultChecked /> On
      </Label>
      <Label style={{ ...rowStyle, opacity: 0.6 }}>
        <Switch disabled /> Disabled off
      </Label>
      <Label style={{ ...rowStyle, opacity: 0.6 }}>
        <Switch defaultChecked disabled /> Disabled on
      </Label>
    </div>
  )
}
