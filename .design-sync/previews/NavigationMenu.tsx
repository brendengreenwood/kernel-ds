import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "kernel-portal"

const deskLinks = [
  ["Load board", "Every inbound truck at a glance."],
  ["Contracts", "Cash, basis, and HTA positions."],
  ["Basis map", "Posted bids across river terminals."],
  ["Settlement", "Scale tickets through payment."],
]

export function PortalNav() {
  return (
    <div style={{ display: "flex", padding: "16px 0 0 24px" }}>
      <NavigationMenu defaultValue="desk">
        <NavigationMenuList>
          <NavigationMenuItem value="desk">
            <NavigationMenuTrigger>Trading desk</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  width: 400,
                  padding: 12,
                  margin: 0,
                  listStyle: "none",
                }}
              >
                {deskLinks.map(([title, desc]) => (
                  <li key={title}>
                    <NavigationMenuLink
                      style={{ display: "block", borderRadius: 6, padding: 12 }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        {desc}
                      </div>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
