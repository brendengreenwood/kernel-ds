import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Same consume-at-source wiring as kernel-app (decision 0034): `@` resolves
// into packages/ui/src so this prototype renders the live Kernel components.
// Their bare deps (@base-ui/react, @mdi/js, …) resolve from the ROOT
// node_modules, so a root `npm ci` must run before this app's install.
const ds = path.resolve(import.meta.dirname, "../../packages/ui/src")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": ds,
      "@app": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: { allow: [path.resolve(import.meta.dirname, "../..")] },
  },
})
