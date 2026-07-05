import {
  Avatar,
  AvatarFallback,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "kernel-portal"

export function FarmHoverCard() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
      <HoverCard open>
        <HoverCardTrigger render={<Button variant="link">Hartmann Farms</Button>} />
        <HoverCardContent style={{ width: 320 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Avatar style={{ width: 48, height: 48 }}>
              <AvatarFallback>HF</AvatarFallback>
            </Avatar>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Hartmann Farms</div>
              <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                Corn and soybeans · 41 loads delivered this season · avg 15.1%
                moisture.
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
