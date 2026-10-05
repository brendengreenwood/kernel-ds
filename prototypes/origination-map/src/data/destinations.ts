import rows from "./destinations.json"

/** Where grain goes, whoever owns it. Sources: data-source/destinations-upstream.md */
export type DestKind = "x" | "f" | "e"

export type Destination = {
  id: number
  kind: DestKind
  name: string
  operator: string
  state: string
  lat: number
  lon: number
  size: number | null
}

export const DEST: Record<DestKind, { label: string; plural: string; unit: string }> = {
  x: { label: "Export port", plural: "Export ports", unit: "" },
  f: { label: "Feedyard", plural: "Feedyards", unit: "head" },
  e: { label: "Ethanol plant", plural: "Ethanol plants", unit: "M gal/yr" },
}

export const DEST_KINDS: DestKind[] = ["x", "f", "e"]

export const DESTINATIONS: Destination[] = (rows as [DestKind, string, string, string, number, number, number | null, string][]).map(
  ([kind, name, operator, state, lat, lon, size], id) => ({ id, kind, name, operator, state, lat, lon, size }),
)

export function destSize(d: Destination) {
  return d.size == null ? "" : ` · ${d.size.toLocaleString()} ${DEST[d.kind].unit}`
}
