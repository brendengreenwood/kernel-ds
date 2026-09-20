import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Consumes the design system AT SOURCE (decision 0034): `@` resolves into the
// DS package, so the app composes from the LIVE Kernel components
// (`@/components/ui/card`, `@/components/ui/status-badge`, …) — no fork copy.
//
// This used to point at kernel-portal/src. The DS moved to packages/ui when the
// monorepo was split (decisions 0047–0052), and the components' own internal
// imports are still `@/components/ui/*` and `@/lib/utils` relative to their new
// home — so repointing this one line is the whole migration. Their bare deps
// (@base-ui/react, @mdi/js, …) are workspace dependencies of packages/ui and
// resolve from the ROOT node_modules, which is why the build now needs a root
// install rather than a kernel-portal one.
const ds = path.resolve(__dirname, "../packages/ui/src")

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
