import { Input, Label } from "kernel-portal"

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="dest">Delivery destination</Label>
      <Input id="dest" placeholder="Prairie Ridge Elevator" />
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Filled</Label>
        <Input defaultValue="Hartmann Farms" />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Error</Label>
        <Input defaultValue="16.2" aria-invalid />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Disabled</Label>
        <Input defaultValue="Locked" disabled />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Read-only</Label>
        <Input defaultValue="CTR-4471" readOnly />
      </div>
    </div>
  )
}

export function InputTypes() {
  return (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="email">Contact email</Label>
        <Input id="email" type="email" placeholder="dispatch@hartmannfarms.com" />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="qty">Contracted bushels</Label>
        <Input id="qty" type="number" defaultValue="18400" />
      </div>
    </div>
  )
}
