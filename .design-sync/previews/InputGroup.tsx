import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  Label,
} from "kernel-portal"
import { Copy, Search } from "lucide-react"

export function PriceWithUnits() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label>Cash price</Label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput defaultValue="4.62" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>/bu</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export function SearchField() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label>Find a load</Label>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search scale tickets…" />
      </InputGroup>
    </div>
  )
}

export function WithButton() {
  return (
    <div style={{ display: "grid", gap: 8, width: 280 }}>
      <Label>Contract ID</Label>
      <InputGroup>
        <InputGroupInput defaultValue="CTR-4471" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Copy contract ID">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export function TextareaWithCount() {
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <Label>Grading notes</Label>
      <InputGroup>
        <InputGroupTextarea defaultValue="Light dockage, no foreign material." />
        <InputGroupAddon align="block-end">
          <InputGroupText>34 / 280</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
