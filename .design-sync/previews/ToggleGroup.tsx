import { ToggleGroup, ToggleGroupItem } from "kernel-portal"

export function Default() {
  return (
    <ToggleGroup defaultValue={["week"]}>
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
    </ToggleGroup>
  )
}

export function Outline() {
  return (
    <ToggleGroup defaultValue={["net"]} variant="outline">
      <ToggleGroupItem value="gross">Gross</ToggleGroupItem>
      <ToggleGroupItem value="tare">Tare</ToggleGroupItem>
      <ToggleGroupItem value="net">Net</ToggleGroupItem>
    </ToggleGroup>
  )
}

export function SmallAndDisabled() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <ToggleGroup defaultValue={["corn"]} variant="outline" size="sm">
        <ToggleGroupItem value="corn">Corn</ToggleGroupItem>
        <ToggleGroupItem value="soybeans">Soybeans</ToggleGroupItem>
        <ToggleGroupItem value="wheat">Wheat</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["all"]} variant="outline" disabled>
        <ToggleGroupItem value="all">All loads</ToggleGroupItem>
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="settled">Settled</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
