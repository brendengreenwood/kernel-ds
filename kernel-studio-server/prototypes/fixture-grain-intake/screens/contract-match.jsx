export default function Screen({ navigate, Kernel }) {
  const [selected, setSelected] = React.useState(null);

  const contracts = [
    { id: "C-2214", buyer: "North Elevator", basis: "-0.35", futures: "SEP 26", remaining: "8,410", status: "booked" },
    { id: "C-2198", buyer: "Riverside Terminal", basis: "-0.28", futures: "SEP 26", remaining: "2,150", status: "booked" },
    { id: "C-2251", buyer: "North Elevator", basis: "-0.41", futures: "DEC 26", remaining: "12,000", status: "pending" },
  ];

  const mono = { fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };
  const num = { ...mono, textAlign: "right" };

  return (
    <div
      data-testid="screen-contract-match"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100%",
        padding: 24,
        fontFamily: "var(--font-sans)",
      }}
    >
      <Kernel.Card style={{ maxWidth: 720, margin: "0 auto" }}>
        <Kernel.CardHeader>
          <Kernel.CardTitle>Contract match</Kernel.CardTitle>
          <Kernel.CardDescription>Pick the contract to apply this load against.</Kernel.CardDescription>
        </Kernel.CardHeader>
        <Kernel.CardContent>
          <Kernel.Table>
            <Kernel.TableHeader>
              <Kernel.TableRow>
                <Kernel.TableHead>Contract</Kernel.TableHead>
                <Kernel.TableHead>Buyer</Kernel.TableHead>
                <Kernel.TableHead style={{ textAlign: "right" }}>Basis</Kernel.TableHead>
                <Kernel.TableHead>Futures</Kernel.TableHead>
                <Kernel.TableHead style={{ textAlign: "right" }}>Remaining bu</Kernel.TableHead>
                <Kernel.TableHead>Status</Kernel.TableHead>
              </Kernel.TableRow>
            </Kernel.TableHeader>
            <Kernel.TableBody>
              {contracts.map((c) => (
                <Kernel.TableRow
                  key={c.id}
                  data-testid={"contract-row-" + c.id}
                  onClick={() => setSelected(c.id)}
                  style={{
                    cursor: "pointer",
                    background: selected === c.id ? "var(--muted)" : undefined,
                  }}
                >
                  <Kernel.TableCell style={mono}>{c.id}</Kernel.TableCell>
                  <Kernel.TableCell>{c.buyer}</Kernel.TableCell>
                  <Kernel.TableCell style={num}>{c.basis}</Kernel.TableCell>
                  <Kernel.TableCell style={mono}>{c.futures}</Kernel.TableCell>
                  <Kernel.TableCell style={num}>{c.remaining}</Kernel.TableCell>
                  <Kernel.TableCell>
                    <Kernel.StatusBadge status={c.status} />
                  </Kernel.TableCell>
                </Kernel.TableRow>
              ))}
            </Kernel.TableBody>
          </Kernel.Table>
        </Kernel.CardContent>
        <Kernel.CardFooter style={{ justifyContent: "space-between" }}>
          <Kernel.Button variant="outline" data-testid="match-back" onClick={() => navigate("intake")}>
            Back to intake
          </Kernel.Button>
          <Kernel.Button
            data-testid="match-apply"
            disabled={selected === null}
            onClick={() => navigate("settlement")}
          >
            Apply &amp; settle
          </Kernel.Button>
        </Kernel.CardFooter>
      </Kernel.Card>
    </div>
  );
}
