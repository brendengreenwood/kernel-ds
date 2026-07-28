import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Kernel Insider consumes the design system AT SOURCE (decision 0034 pattern):
// `@` resolves into kernel-portal/src, so DS imports (`@/components/ui/*`,
// `@/lib/utils`) match portal code exactly. DS deps resolve from
// kernel-portal/node_modules; this app installs only what it imports.
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
