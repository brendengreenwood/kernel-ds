import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "kernel-portal"

export function ContractTabs() {
  return (
    <Tabs defaultValue="deliveries" style={{ width: "100%", maxWidth: 480 }}>
      <TabsList>
        <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="settlement">Settlement</TabsTrigger>
      </TabsList>
      <TabsContent value="deliveries">
        <div style={{ fontSize: 14, color: "var(--muted-foreground)", paddingTop: 4 }}>
          12 loads applied against CTR-2214 — 41,270 of 60,000 bu delivered.
        </div>
      </TabsContent>
      <TabsContent value="pricing">
        <div style={{ fontSize: 14, color: "var(--muted-foreground)", paddingTop: 4 }}>
          Basis locked at -0.32 Dec 26 futures; 18,730 bu remain unpriced.
        </div>
      </TabsContent>
      <TabsContent value="settlement">
        <div style={{ fontSize: 14, color: "var(--muted-foreground)", paddingTop: 4 }}>
          Net proceeds $98,382.90 after drying and shrink deductions.
        </div>
      </TabsContent>
    </Tabs>
  )
}
