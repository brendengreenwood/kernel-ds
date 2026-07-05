import * as React from "react"
import { Label, Slider } from "kernel-portal"

export function Default() {
  return (
    <div style={{ width: 280, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label>Moisture threshold</Label>
        <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>15%</span>
      </div>
      <Slider defaultValue={[15]} max={30} step={1} />
    </div>
  )
}

export function Range() {
  return (
    <div style={{ width: 280, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label>Basis range ($/bu)</Label>
        <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>-0.40 to -0.15</span>
      </div>
      <Slider defaultValue={[20, 80]} max={100} step={5} />
    </div>
  )
}

export function DisabledState() {
  return (
    <div style={{ width: 280, display: "grid", gap: 12 }}>
      <Label>Storage capacity used (locked)</Label>
      <Slider defaultValue={[65]} max={100} disabled />
    </div>
  )
}
