import * as React from "react"
import type { MapData } from "@app/map/model"
import { publicMapData } from "@app/map/adapters/public"

const MapDataContext = React.createContext<MapData>(publicMapData)

/** Swap the adapter here (or higher in the tree) to point the map at different data. */
export function MapDataProvider({ data, children }: { data: MapData; children: React.ReactNode }) {
  return <MapDataContext.Provider value={data}>{children}</MapDataContext.Provider>
}

export function useMapData() {
  return React.useContext(MapDataContext)
}
