export default function Screen({ navigate, Kernel }) {
  const rows = [
    ["Gross bushels", "1,024.60"],
    ["Moisture shrink (14.2% → 13.0%)", "-14.33"],
    ["Net bushels", "1,010.27"],
    ["Cash price (futures + basis)", "$5.42"],
  ];

  const mono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  const num = { ...mono, textAlign: "right" };

  return (
    <div
      data-testid="screen-settlement"
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
            <Kernel.CardTitle>Settlement summary</Kernel.CardTitle>
            <Kernel.StatusBadge status="settled" />
          </div>
          <Kernel.CardDescription>Ticket T-10482 · Hartley Bros. · Contract C-2214</Kernel.CardDescription>
        </Kernel.CardHeader>
        <Kernel.CardContent style={{ display: "grid", gap: 16 }}>
          <Kernel.Table>
            <Kernel.TableBody>
              {rows.map(([label, value]) => (
                <Kernel.TableRow key={label}>
                  <Kernel.TableCell>{label}</Kernel.TableCell>
                  <Kernel.TableCell style={num}>{value}</Kernel.TableCell>
                </Kernel.TableRow>
              ))}
              <Kernel.TableRow>
                <Kernel.TableCell style={{ fontWeight: 600 }}>Settlement value</Kernel.TableCell>
                <Kernel.TableCell data-testid="settlement-total" style={{ ...num, fontWeight: 600 }}>
                  $5,475.66
                </Kernel.TableCell>
              </Kernel.TableRow>
            </Kernel.TableBody>
          </Kernel.Table>
          <Kernel.Alert variant="success" data-testid="settlement-alert">
            <Kernel.AlertTitle>Load settled</Kernel.AlertTitle>
            <Kernel.AlertDescription>
              Settlement posted to the Hartley Bros. account.
            </Kernel.AlertDescription>
          </Kernel.Alert>
        </Kernel.CardContent>
        <Kernel.CardFooter style={{ justifyContent: "flex-end" }}>
          <Kernel.Button data-testid="settlement-new-load" onClick={() => navigate("intake")}>
            New load
          </Kernel.Button>
        </Kernel.CardFooter>
      </Kernel.Card>
    </div>
  );
}
