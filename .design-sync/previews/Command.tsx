import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "kernel-portal"
import { Calculator, Truck, Wheat } from "lucide-react"

export function GrainCommandPalette() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
      <Command
        style={{
          width: 448,
          borderRadius: 8,
          border: "1px solid var(--border)",
          boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
        }}
      >
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem>
              <Wheat /> Book contract
            </CommandItem>
            <CommandItem>
              <Truck /> New load
            </CommandItem>
            <CommandItem>
              <Calculator /> Reprice basis
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Farms">
            <CommandItem>Hartmann Farms</CommandItem>
            <CommandItem>Valley Co-op</CommandItem>
            <CommandItem>Birchwood Grain</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
