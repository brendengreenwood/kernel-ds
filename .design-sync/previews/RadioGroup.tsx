import * as React from "react"
import { Label, RadioGroup, RadioGroupItem } from "kernel-portal"

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 400,
}

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Label>Delivery method</Label>
      <RadioGroup defaultValue="truck" style={{ display: "grid", gap: 12 }}>
        <Label style={rowStyle}>
          <RadioGroupItem value="truck" /> Farm truck
        </Label>
        <Label style={rowStyle}>
          <RadioGroupItem value="rail" /> Rail shuttle
        </Label>
        <Label style={rowStyle}>
          <RadioGroupItem value="barge" /> Barge — river terminal
        </Label>
      </RadioGroup>
    </div>
  )
}

export function ContractTypes() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Label>Contract type</Label>
      <RadioGroup defaultValue="basis" style={{ display: "grid", gap: 12 }}>
        <Label style={rowStyle}>
          <RadioGroupItem value="cash" /> Cash sale
        </Label>
        <Label style={rowStyle}>
          <RadioGroupItem value="basis" /> Basis contract
        </Label>
        <Label style={rowStyle}>
          <RadioGroupItem value="hta" /> Hedge-to-arrive
        </Label>
      </RadioGroup>
    </div>
  )
}

export function DisabledState() {
  return (
    <RadioGroup defaultValue="open" style={{ display: "grid", gap: 12 }}>
      <Label style={rowStyle}>
        <RadioGroupItem value="open" /> Open storage
      </Label>
      <Label style={{ ...rowStyle, opacity: 0.6 }}>
        <RadioGroupItem value="condo" disabled /> Condo storage (full)
      </Label>
    </RadioGroup>
  )
}
