/// <reference types="vite/client" />

// Vite's `?worker&url` form returns the emitted worker chunk's URL as a string.
// MapLibre 6 needs it to boot its tile-parsing worker (see map-canvas.tsx).
declare module "*?worker&url" {
  const src: string
  export default src
}
