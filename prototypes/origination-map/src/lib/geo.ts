const EARTH_MI = 3958.8
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Great-circle distance in statute miles. */
export function miles(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Geodesic circle as a closed GeoJSON ring of [lon, lat]. */
export function circleRing(lat: number, lon: number, radiusMi: number, steps = 64): [number, number][] {
  const d = radiusMi / EARTH_MI
  const φ1 = rad(lat)
  const λ1 = rad(lon)
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const θ = (i / steps) * 2 * Math.PI
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ))
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2))
    ring.push([deg(λ2), deg(φ2)])
  }
  return ring
}
