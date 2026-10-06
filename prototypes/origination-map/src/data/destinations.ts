import rows from "./destinations.json"
import type { DestKind, Destination } from "@app/map/objects/destination"

/** Where grain goes, whoever owns it. Sources: data-source/destinations-upstream.md
    Rows use letter kinds (x port, f feedyard, e ethanol), translated here. */
const KIND: Record<string, DestKind> = { x: "port", f: "feedyard", e: "ethanol" }

export const DESTINATIONS: Destination[] = (rows as [string, string, string, string, number, number, number | null, string][]).map(
  ([kind, name, operator, state, lat, lon, size], id) => ({ id, kind: KIND[kind], name, operator, state, lat, lon, size }),
)
