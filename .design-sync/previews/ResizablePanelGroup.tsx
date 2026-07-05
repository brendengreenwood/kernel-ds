import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "kernel-portal"

export function WorkspaceSplit() {
  return (
    <div style={{ height: 200, width: "100%", maxWidth: 520 }}>
      <ResizablePanelGroup
        orientation="horizontal"
        style={{
          height: "100%",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <ResizablePanel defaultSize={35}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              padding: 16,
              fontSize: 13,
              color: "var(--muted-foreground)",
            }}
          >
            Open contracts
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              padding: 16,
              fontSize: 13,
              color: "var(--muted-foreground)",
            }}
          >
            CTR-2214 · Hartmann Farms · 60,000 bu corn
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
