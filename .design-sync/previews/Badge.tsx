import { Badge } from "kernel-portal"
import { CheckCircle2, Clock, Truck } from "lucide-react"

export function SoftSemanticVariants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge variant="success">Settled</Badge>
      <Badge variant="warning">On hold</Badge>
      <Badge variant="info">Booked</Badge>
      <Badge variant="destructive">Rejected</Badge>
    </div>
  )
}

export function BaseVariants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  )
}

export function WithIcons() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <Badge variant="success">
        <CheckCircle2 /> Payment cleared
      </Badge>
      <Badge variant="info">
        <Truck /> 3 loads en route
      </Badge>
      <Badge variant="warning">
        <Clock /> Awaiting grade
      </Badge>
    </div>
  )
}
