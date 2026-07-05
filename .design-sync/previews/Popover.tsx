import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "kernel-portal"

export function AdjustBasisPopover() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
      <Popover open>
        <PopoverTrigger render={<Button variant="outline">Adjust basis</Button>} />
        <PopoverContent style={{ width: 288 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Corn basis — river terminal
              </div>
              <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                Applies to unpriced loads booked this week.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "grid", flex: 1, gap: 6 }}>
                <Label htmlFor="basis" style={{ fontSize: 12 }}>
                  Basis
                </Label>
                <Input id="basis" defaultValue="-0.35" style={{ height: 32 }} />
              </div>
              <div style={{ display: "grid", flex: 1, gap: 6 }}>
                <Label htmlFor="month" style={{ fontSize: 12 }}>
                  Futures month
                </Label>
                <Input id="month" defaultValue="DEC 26" style={{ height: 32 }} />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
