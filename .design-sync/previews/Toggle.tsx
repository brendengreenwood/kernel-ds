import { Toggle } from "kernel-portal"
import { Bold, Italic, Underline, BellRing } from "lucide-react"

export function Default() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Toggle aria-label="Bold" defaultPressed>
        <Bold />
      </Toggle>
      <Toggle aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle aria-label="Underline">
        <Underline />
      </Toggle>
    </div>
  )
}

export function OutlineWithText() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Toggle variant="outline" defaultPressed>
        <BellRing /> Watch basis
      </Toggle>
      <Toggle variant="outline">Show settled</Toggle>
    </div>
  )
}

export function SizesAndDisabled() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Toggle variant="outline" size="sm">
        Small
      </Toggle>
      <Toggle variant="outline">Default</Toggle>
      <Toggle variant="outline" size="lg">
        Large
      </Toggle>
      <Toggle variant="outline" disabled>
        Disabled
      </Toggle>
    </div>
  )
}
