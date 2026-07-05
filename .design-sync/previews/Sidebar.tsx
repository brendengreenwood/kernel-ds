import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "kernel-portal"

const nav = [
  { title: "Overview", active: false },
  { title: "Loads", active: true, badge: "12" },
  { title: "Contracts", active: false },
  { title: "Settlements", active: false },
  { title: "Basis board", active: false },
]

export function PortalSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "calc(var(--radius) - 2px)",
                background: "var(--sidebar-primary)",
                color: "var(--sidebar-primary-foreground)",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              K
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Kernel</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>
                grain merchant
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Merchandising</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.active}
                      render={
                        <a href="#">
                          <span>{item.title}</span>
                        </a>
                      }
                    />
                    {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Loads</div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
            12 loads in transit · 41,270 bu applied this week
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
