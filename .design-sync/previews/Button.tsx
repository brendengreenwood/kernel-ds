import { Button } from "kernel-portal"
import { Plus, Download, Trash2 } from "lucide-react"

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Button>Book contract</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete load</Button>
      <Button variant="link">View settlement</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  )
}

export function WithIconsAndStates() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Button>
        <Plus /> New load
      </Button>
      <Button variant="outline">
        <Download /> Export
      </Button>
      <Button variant="destructive">
        <Trash2 /> Remove
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled outline
      </Button>
    </div>
  )
}
