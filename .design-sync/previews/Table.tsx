import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  StatusBadge,
} from "kernel-portal"

const loads = [
  { id: "#4471", farm: "Hartmann Farms", grain: "Corn", status: "in_transit" as const, bu: "18,400", price: "4.62" },
  { id: "#4468", farm: "Valley Co-op", grain: "Soybean", status: "settled" as const, bu: "9,120", price: "11.08" },
  { id: "#4465", farm: "Birchwood Grain", grain: "Wheat", status: "on_hold" as const, bu: "12,750", price: "5.94" },
  { id: "#4460", farm: "Hartmann Farms", grain: "Corn", status: "rejected" as const, bu: "0", price: "—" },
]

const num = {
  textAlign: "right",
  fontFamily: "var(--font-mono)",
  fontVariantNumeric: "tabular-nums",
} as const

export function LoadsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Load</TableHead>
          <TableHead>Farm</TableHead>
          <TableHead>Grain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: "right" }}>Net bu</TableHead>
          <TableHead style={{ textAlign: "right" }}>$/bu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loads.map((l) => (
          <TableRow key={l.id}>
            <TableCell style={{ fontFamily: "var(--font-mono)" }}>{l.id}</TableCell>
            <TableCell style={{ fontWeight: 500 }}>{l.farm}</TableCell>
            <TableCell>{l.grain}</TableCell>
            <TableCell>
              <StatusBadge status={l.status} />
            </TableCell>
            <TableCell style={num}>{l.bu}</TableCell>
            <TableCell style={num}>{l.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>3 deliverable loads</TableCell>
          <TableCell style={num}>40,270</TableCell>
          <TableCell style={num} />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
