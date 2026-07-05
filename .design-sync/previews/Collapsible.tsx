import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "kernel-portal"
import { ChevronsUpDown } from "lucide-react"

const loads = [
  "#4471 · Corn · 980 bu · in transit",
  "#4468 · Soybeans · 1,020 bu · at scale",
  "#4465 · Corn · 960 bu · awaiting grade",
]

function LoadsPanel({ defaultOpen }: { defaultOpen: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} style={{ width: 320, display: "grid", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--card)",
          padding: "8px 8px 8px 16px",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>3 open loads at Ridgeway</span>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Toggle loads">
              <ChevronsUpDown />
            </Button>
          }
        />
      </div>
      <CollapsibleContent style={{ display: "grid", gap: 8 }}>
        {loads.map((load) => (
          <div
            key={load}
            style={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card)",
              padding: "10px 16px",
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--muted-foreground)",
            }}
          >
            {load}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Open() {
  return <LoadsPanel defaultOpen={true} />
}

export function Closed() {
  return <LoadsPanel defaultOpen={false} />
}
