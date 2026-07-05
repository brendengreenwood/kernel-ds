import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "kernel-portal"

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="dest">Destination elevator</Label>
      <Select>
        <SelectTrigger id="dest">
          <SelectValue placeholder="Choose an elevator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prairie">Prairie Ridge Elevator</SelectItem>
          <SelectItem value="cargill">Cargill — Cedar Rapids</SelectItem>
          <SelectItem value="adm">ADM — Clinton</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function WithValue() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label htmlFor="commodity">Commodity</Label>
      <Select
        defaultValue="corn"
        items={{ corn: "Corn (yellow #2)", soybeans: "Soybeans", wheat: "HRW Wheat" }}
      >
        <SelectTrigger id="commodity">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="corn">Corn (yellow #2)</SelectItem>
          <SelectItem value="soybeans">Soybeans</SelectItem>
          <SelectItem value="wheat">HRW Wheat</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Small</Label>
        <Select defaultValue="bu" items={{ bu: "bu", cwt: "cwt", tons: "tons" }}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bu">bu</SelectItem>
            <SelectItem value="cwt">cwt</SelectItem>
            <SelectItem value="tons">tons</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Error</Label>
        <Select>
          <SelectTrigger aria-invalid>
            <SelectValue placeholder="Select a buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landus">Landus Cooperative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label>Disabled</Label>
        <Select defaultValue="closed" items={{ closed: "Market closed" }} disabled>
          <SelectTrigger disabled>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="closed">Market closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
