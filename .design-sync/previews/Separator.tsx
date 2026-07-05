import { Separator } from "kernel-portal"

export function Horizontal() {
  return (
    <div style={{ width: 280 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Ridgeway River Terminal</div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Corn · soybeans · SRW wheat
        </div>
      </div>
      <Separator style={{ marginTop: 16, marginBottom: 16 }} />
      <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
        Posted basis updates weekdays at 9 AM and 1 PM.
      </div>
    </div>
  )
}

export function Vertical() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        height: 20,
        fontSize: 13,
        color: "var(--muted-foreground)",
      }}
    >
      <span>5,000 bu</span>
      <Separator orientation="vertical" />
      <span>$4.62/bu</span>
      <Separator orientation="vertical" />
      <span>-22¢ basis</span>
    </div>
  )
}
