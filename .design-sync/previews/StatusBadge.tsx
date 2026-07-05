import { StatusBadge } from "kernel-portal"

export function LifecycleStatuses() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <StatusBadge status="draft" />
      <StatusBadge status="pending" />
      <StatusBadge status="booked" />
      <StatusBadge status="in_transit" />
      <StatusBadge status="delivered" />
      <StatusBadge status="settled" />
      <StatusBadge status="on_hold" />
      <StatusBadge status="rejected" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="expired" />
    </div>
  )
}

export function CustomLabel() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <StatusBadge status="settled">Paid in full</StatusBadge>
      <StatusBadge status="in_transit">Truck 14 · ETA 2:40 pm</StatusBadge>
    </div>
  )
}
