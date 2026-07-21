/**
 * Definitions loader — persisted object/workspace JSON registers at boot.
 *
 * `loadDefinitions()` fetches `/definitions/manifest.json` and registers
 * every listed document: objects go through `parseObjectModel` →
 * `registerObject` (the only registry write path), workspace presets go
 * through `parseWorkspacePreset` → the preset store below. The shipped
 * manifest lists ZERO definitions — persisted documents appear only when
 * the studio define tool writes them (decision 0033).
 *
 * Manifest tolerance is SPECIFIED behavior, not defensive garnish: the
 * deployed site's SPA redirect (`/* → /index.html`, status 200) means a
 * missing `/definitions/manifest.json` returns HTML with HTTP 200 — a
 * 404 branch never fires. Any of non-OK response, non-JSON content type,
 * or JSON parse failure therefore means "zero definitions" and returns
 * silently.
 *
 * Failure isolation: one bad document must not take down boot or the
 * other documents — per-document errors are caught and collected in
 * `failed`, never thrown.
 *
 * UI-agnostic: no react, no component imports — loadable from Node
 * scripts and checks like the rest of lib/objects.
 */

import { registerObject } from "./registry.ts"
import { parseObjectModel } from "./schema.ts"
import { parseWorkspacePreset, type WorkspacePreset } from "./workspace-preset.ts"

interface ManifestEntry {
  kind: "object" | "workspace"
  path: string
}

export interface DefinitionsLoadResult {
  loaded: number
  failed: { path: string; error: string }[]
}

/**
 * Runtime workspace-preset store — mirrors registry.ts's listener
 * pattern (cached snapshot, replaced only on register, stable between
 * registrations for `useSyncExternalStore`).
 */
const presets: Record<string, WorkspacePreset> = {}
const listeners = new Set<() => void>()
let snapshot: readonly WorkspacePreset[] = []

/** Register (or re-register) a preset. Idempotent by `preset.key`. */
export function registerWorkspacePreset(preset: WorkspacePreset): void {
  presets[preset.key] = preset
  snapshot = Object.values(presets)
  for (const listener of listeners) listener()
}

/** Stable between registrations — safe for `useSyncExternalStore`. */
export function getWorkspacePresets(): readonly WorkspacePreset[] {
  return snapshot
}

export function subscribeToWorkspacePresets(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Load and register every definition listed in the manifest. Returns
 * `{ loaded, failed }`; a missing/HTML/unparsable manifest resolves to
 * `{ loaded: 0, failed: [] }` (see module doc — SPA redirect).
 */
export async function loadDefinitions(baseUrl = ""): Promise<DefinitionsLoadResult> {
  let entries: ManifestEntry[]
  try {
    const res = await fetch(`${baseUrl}/definitions/manifest.json`)
    if (!res.ok) return { loaded: 0, failed: [] }
    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("json")) return { loaded: 0, failed: [] }
    const manifest: unknown = await res.json()
    const listed = (manifest as { definitions?: unknown }).definitions
    entries = Array.isArray(listed) ? (listed as ManifestEntry[]) : []
  } catch {
    return { loaded: 0, failed: [] }
  }

  const result: DefinitionsLoadResult = { loaded: 0, failed: [] }
  for (const entry of entries) {
    const entryPath = typeof entry?.path === "string" ? entry.path : "(missing path)"
    try {
      const res = await fetch(`${baseUrl}/definitions/${entry.path}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (entry.kind === "object") {
        const { model, rows } = parseObjectModel(text)
        registerObject(model, rows)
      } else if (entry.kind === "workspace") {
        registerWorkspacePreset(parseWorkspacePreset(text))
      } else {
        throw new Error(`unknown definition kind "${String(entry.kind)}"`)
      }
      result.loaded += 1
    } catch (err) {
      result.failed.push({
        path: entryPath,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  return result
}
