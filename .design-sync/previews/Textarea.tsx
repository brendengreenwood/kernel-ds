import { Label, Textarea } from "kernel-portal"

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <Label htmlFor="notes">Grading notes</Label>
      <Textarea id="notes" placeholder="Describe dockage, moisture, foreign material…" />
    </div>
  )
}

export function Filled() {
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <Label htmlFor="remarks">Load remarks</Label>
      <Textarea
        id="remarks"
        defaultValue="Light dockage, no foreign material. Moisture at 14.1% — within contract spec."
      />
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 16, width: 320 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Error</Label>
        <Textarea defaultValue="Rejected at scale" aria-invalid />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Disabled</Label>
        <Textarea defaultValue="Settlement finalized — notes locked." disabled />
      </div>
    </div>
  )
}
