const originalFetch = globalThis.fetch
const { loadDefinitions } = await import("./definitions-loader.ts")

function response(body, contentType = "application/json", status = 200) {
  return new Response(body, { status, headers: { "content-type": contentType } })
}

try {
  globalThis.fetch = async () => response("<html>spa fallback</html>", "text/html")
  const htmlResult = await loadDefinitions("https://kernel.test")
  if (htmlResult.loaded !== 0 || htmlResult.failed.length !== 0) {
    throw new Error("HTML manifest fallback must load zero definitions without failures")
  }

  globalThis.fetch = async (url) => {
    if (String(url).endsWith("manifest.json")) {
      return response(JSON.stringify({ definitions: [
        { kind: "object", path: "objects/bad.json" },
        { kind: "unknown", path: "objects/unknown.json" },
      ] }))
    }
    if (String(url).endsWith("bad.json")) return response("{}")
    return response("{}")
  }
  const isolated = await loadDefinitions("https://kernel.test")
  if (isolated.loaded !== 0 || isolated.failed.length !== 2) {
    throw new Error("invalid documents must be isolated and reported individually")
  }

  console.log("DEFINITIONS-LOADER-OK: SPA tolerance and per-document failure isolation")
} finally {
  globalThis.fetch = originalFetch
}
