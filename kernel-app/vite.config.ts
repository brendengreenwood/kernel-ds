import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Self-contained: the design system pieces this app uses (the MDI icon shim,
// `cn`, and the full token sheet) are vendored under src/, so it builds and
// deploys with nothing but its own directory. `@` and `@app` both point here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "recharts"],
  },
})
