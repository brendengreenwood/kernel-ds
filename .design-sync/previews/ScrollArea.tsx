import { ScrollArea } from "kernel-portal"

const loads = [
  { id: "#4471", detail: "Corn · 18,400 bu · Hartmann Farms" },
  { id: "#4468", detail: "Soybean · 9,120 bu · Valley Co-op" },
  { id: "#4465", detail: "Wheat · 12,750 bu · Birchwood Grain" },
  { id: "#4462", detail: "Corn · 21,300 bu · Meadowlark Elevator" },
  { id: "#4460", detail: "Corn · 17,880 bu · Hartmann Farms" },
  { id: "#4457", detail: "Soybean · 8,540 bu · Valley Co-op" },
  { id: "#4451", detail: "Wheat · 11,020 bu · Birchwood Grain" },
  { id: "#4449", detail: "Corn · 19,660 bu · Meadowlark Elevator" },
]

export function IncomingLoads() {
  return (
    <ScrollArea
      style={{
        height: 180,
        width: 280,
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--card)",
        padding: 8,
      }}
    >
      {loads.map((l, i) => (
        <div
          key={l.id}
          style={{
            padding: "8px 12px",
            borderBottom: i === loads.length - 1 ? "none" : "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>
            Load {l.id}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{l.detail}</div>
        </div>
      ))}
    </ScrollArea>
  )
}
