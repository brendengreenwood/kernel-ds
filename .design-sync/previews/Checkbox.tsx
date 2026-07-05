import * as React from "react"
import { Checkbox, Label } from "kernel-portal"

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
        <Checkbox defaultChecked /> Subscribe to bid alerts
      </Label>
      <Label style={rowStyle}>
        <Checkbox /> Include settled contracts
      </Label>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Label style={rowStyle}>
        <Checkbox /> Unchecked
      </Label>
      <Label style={rowStyle}>
        <Checkbox defaultChecked /> Checked
      </Label>
      <Label style={rowStyle}>
        <Checkbox indeterminate /> Indeterminate
      </Label>
      <Label style={{ ...rowStyle, opacity: 0.6 }}>
        <Checkbox disabled /> Disabled
      </Label>
      <Label style={{ ...rowStyle, opacity: 0.6 }}>
        <Checkbox defaultChecked disabled /> Disabled checked
      </Label>
    </div>
  )
}
