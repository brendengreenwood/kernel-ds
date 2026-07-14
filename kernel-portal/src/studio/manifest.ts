/**
 * Prototype manifest types + fetching, matching the version-1 contract in
 * kernel-studio-server/PROTOTYPE-CONTRACT.md (schema of record:
 * kernel-studio-server/src/contract/manifest.ts).
 */

export interface PrototypeScreen {
  id: string
  title: string
  file: string
  description?: string
}

export interface PrototypeEdge {
  from: string
  to: string
  label?: string
}

export interface PrototypeDirection {
  id: string
  title: string
  note?: string
  screens: PrototypeScreen[]
  edges: PrototypeEdge[]
}

export interface PrototypeManifest {
  version: 1
  id: string
  title: string
  prompt: string
  createdAt: string
  directions: PrototypeDirection[]
}

const PROTOTYPES_BASE = "/studio/prototypes"

export async function listPrototypeIds(): Promise<string[]> {
  const res = await fetch(`${PROTOTYPES_BASE}/index.json`)
  if (!res.ok) throw new Error(`Failed to list prototypes: ${res.status}`)
  const body = (await res.json()) as { prototypes: string[] }
  return body.prototypes
}

export async function fetchManifest(prototypeId: string): Promise<PrototypeManifest> {
  const res = await fetch(`${PROTOTYPES_BASE}/${prototypeId}/manifest.json`)
  if (!res.ok) throw new Error(`Failed to fetch manifest for ${prototypeId}: ${res.status}`)
  const manifest = (await res.json()) as PrototypeManifest
  if (manifest.version !== 1) throw new Error(`Unsupported manifest version: ${String(manifest.version)}`)
  return manifest
}

export function screenUrl(prototypeId: string, screenFile: string): string {
  return `${PROTOTYPES_BASE}/${prototypeId}/${screenFile}`
}
