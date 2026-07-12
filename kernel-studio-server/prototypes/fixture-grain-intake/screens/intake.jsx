export default function Screen({ navigate, Kernel }) {
  const [ticket, setTicket] = React.useState("");
  const [farm, setFarm] = React.useState("");
  const [bushels, setBushels] = React.useState("");
  const [moisture, setMoisture] = React.useState("");

  const field = { display: "grid", gap: 6 };
  const labelStyle = { fontSize: 13, fontWeight: 500 };
  const mono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };

  return (
    <div
      data-testid="screen-intake"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100%",
        padding: 24,
        fontFamily: "var(--font-sans)",
      }}
    >
      <Kernel.Card style={{ maxWidth: 560, margin: "0 auto" }}>
        <Kernel.CardHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Kernel.CardTitle>New load intake</Kernel.CardTitle>
            <Kernel.StatusBadge status="draft" />
          </div>
          <Kernel.CardDescription>Enter the scale ticket for an inbound load.</Kernel.CardDescription>
        </Kernel.CardHeader>
        <Kernel.CardContent style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={field}>
              <Kernel.Label htmlFor="fx-ticket" style={labelStyle}>Ticket #</Kernel.Label>
              <Kernel.Input
                id="fx-ticket"
                data-testid="intake-ticket"
                value={ticket}
                placeholder="T-10482"
                onChange={(e) => setTicket(e.target.value)}
                style={mono}
              />
            </div>
            <div style={field}>
              <Kernel.Label htmlFor="fx-farm" style={labelStyle}>Farm</Kernel.Label>
              <Kernel.Input
                id="fx-farm"
                data-testid="intake-farm"
                value={farm}
                placeholder="Hartley Bros."
                onChange={(e) => setFarm(e.target.value)}
              />
            </div>
          </div>
          <div style={field}>
            <Kernel.Label style={labelStyle}>Commodity</Kernel.Label>
            <Kernel.Select
              defaultValue="hrw"
              items={{ hrw: "Wheat — HRW", corn: "Corn — #2 Yellow", soy: "Soybeans" }}
            >
              <Kernel.SelectTrigger data-testid="intake-commodity">
                <Kernel.SelectValue />
              </Kernel.SelectTrigger>
              <Kernel.SelectContent>
                <Kernel.SelectItem value="hrw">Wheat — HRW</Kernel.SelectItem>
                <Kernel.SelectItem value="corn">Corn — #2 Yellow</Kernel.SelectItem>
                <Kernel.SelectItem value="soy">Soybeans</Kernel.SelectItem>
              </Kernel.SelectContent>
            </Kernel.Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={field}>
              <Kernel.Label htmlFor="fx-bushels" style={labelStyle}>Gross bushels</Kernel.Label>
              <Kernel.Input
                id="fx-bushels"
                data-testid="intake-bushels"
                inputMode="decimal"
                value={bushels}
                placeholder="1,024.60"
                onChange={(e) => setBushels(e.target.value)}
                style={{ ...mono, textAlign: "right" }}
              />
            </div>
            <div style={field}>
              <Kernel.Label htmlFor="fx-moisture" style={labelStyle}>Moisture %</Kernel.Label>
              <Kernel.Input
                id="fx-moisture"
                data-testid="intake-moisture"
                inputMode="decimal"
                value={moisture}
                placeholder="14.2"
                onChange={(e) => setMoisture(e.target.value)}
                style={{ ...mono, textAlign: "right" }}
              />
            </div>
          </div>
        </Kernel.CardContent>
        <Kernel.CardFooter style={{ justifyContent: "flex-end" }}>
          <Kernel.Button data-testid="intake-continue" onClick={() => navigate("contract-match")}>
            Match to contract
          </Kernel.Button>
        </Kernel.CardFooter>
      </Kernel.Card>
    </div>
  );
}
