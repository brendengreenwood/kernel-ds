/**
 * Vite library build config for the ds-bundle.
 *
 * Bundles all UI components as an IIFE exposing `window.Kernel`,
 * with React and ReactDOM as externals (vendored separately).
 *
 * Usage: npx vite build --config vite.lib.config.ts
 * Output: ../ds-bundle/_ds_bundle.js + ../ds-bundle/_ds_bundle.css
 */
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/ds-entry.ts"),
      name: "Kernel",
      formats: ["iife"],
      fileName: () => "_ds_bundle.js",
    },
    outDir: path.resolve(__dirname, "../ds-bundle"),
    emptyOutDir: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "React",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((n) => n.endsWith(".css"))) return "_ds_bundle.css"
          return assetInfo.names?.[0] ?? "asset"
        },
      },
    },
    cssCodeSplit: false,
    minify: false,
    sourcemap: false,
  },
})
