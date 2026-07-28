import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Consumes the design system AT SOURCE (decision 0034): `@` resolves into
// kernel-portal/src, so the app composes from the LIVE Kernel components
// (`@/components/ui/card`, `@/components/ui/status-badge`, …) — no fork copy.
// DS deps resolve from kernel-portal/node_modules; this app installs only what
// it imports itself.
const ds = path.resolve(__dirname, "../kernel-portal/src")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": ds,
      "@app": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "recharts"],
  },
  server: {
    fs: { allow: [path.resolve(__dirname, "..")] },
  },
})
