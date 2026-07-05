import * as React from "react"
import { AspectRatio } from "kernel-portal"

const frame = (ratio: number): React.CSSProperties => ({
  "--ratio": ratio,
  overflow: "hidden",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--muted)",
} as React.CSSProperties)

const label: React.CSSProperties = {
  display: "grid",
  height: "100%",
  placeItems: "center",
  fontFamily: "monospace",
  fontSize: 12,
  color: "var(--primary)",
}

export function Widescreen() {
  return (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9} style={frame(16 / 9)}>
        <div style={label}>16 : 9 · elevator cam</div>
      </AspectRatio>
    </div>
  )
}

export function Square() {
  return (
    <div style={{ width: 160 }}>
      <AspectRatio ratio={1} style={frame(1)}>
        <div style={label}>1 : 1 · grade photo</div>
      </AspectRatio>
    </div>
  )
}
