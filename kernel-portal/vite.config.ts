import fs from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const CONTENT_TYPES: Record<string, string> = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".jsx": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".md": "text/markdown",
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
}

/**
 * Dev-server-only middleware for Kernel Studio: serves the ds-bundle runtime
 * and generated prototypes to the browser. Neither directory is part of the
 * built site — the studio surface only works under `vite dev`.
 */
function studioFilesPlugin(): Plugin {
  const mounts: Array<{ urlPrefix: string; dir: string }> = [
    { urlPrefix: "/ds-bundle/", dir: path.resolve(__dirname, "../ds-bundle") },
    { urlPrefix: "/studio/prototypes/", dir: path.resolve(__dirname, "../kernel-studio-server/prototypes") },
  ]
  return {
    name: "kernel-studio-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0]
        const mount = mounts.find((m) => url.startsWith(m.urlPrefix))
        if (!mount || (req.method !== "GET" && req.method !== "HEAD")) return next()

        const relative = decodeURIComponent(url.slice(mount.urlPrefix.length))

        // Generated listing: /studio/prototypes/index.json -> ids of dirs with a manifest.json
        if (mount.urlPrefix === "/studio/prototypes/" && relative === "index.json") {
          fs.readdir(mount.dir, { withFileTypes: true }, (err, entries) => {
            const ids = err
              ? []
              : entries
                  .filter((e) => e.isDirectory() && fs.existsSync(path.join(mount.dir, e.name, "manifest.json")))
                  .map((e) => e.name)
                  .sort()
            res.setHeader("Content-Type", "application/json")
            res.setHeader("Cache-Control", "no-store")
            res.end(JSON.stringify({ prototypes: ids }))
          })
          return
        }

        const resolved = path.resolve(mount.dir, relative)
        if (resolved !== mount.dir && !resolved.startsWith(mount.dir + path.sep)) {
          res.statusCode = 403
          res.end("Forbidden")
          return
        }

        fs.stat(resolved, (err, stat) => {
          if (err || !stat.isFile()) return next()
          res.setHeader(
            "Content-Type",
            CONTENT_TYPES[path.extname(resolved).toLowerCase()] ?? "application/octet-stream",
          )
          // Prototypes regenerate in place under the same URLs; never let the
          // browser cache a stale manifest or screen.
          res.setHeader("Cache-Control", "no-store")
          fs.createReadStream(resolved).pipe(res)
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), studioFilesPlugin()],
  // sucrase is only reached via dynamic import from the studio loader; pre-bundle it
  // so its first use doesn't trigger a mid-session dep-optimizer full reload.
  optimizeDeps: {
    include: ["sucrase"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
