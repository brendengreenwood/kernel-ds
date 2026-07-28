import { formsClusters } from "@/components/portal/gallery-forms"
import { dataClusters } from "@/components/portal/gallery-data"
import { overlaysClusters } from "@/components/portal/gallery-overlays"
import { navClusters } from "@/components/portal/gallery-nav"
import { miscClusters } from "@/components/portal/gallery-misc"
import { aiClusters } from "@/components/portal/gallery-ai"
import type { GalleryCluster } from "./gallery-types"

/** Every component page, in rail order (decision 0011). */
export const galleryClusters: GalleryCluster[] = [
  ...formsClusters,
  ...dataClusters,
  ...overlaysClusters,
  ...navClusters,
  ...miscClusters,
  ...aiClusters,
]

export const clusterBySlug = new Map(galleryClusters.map((c) => [c.slug, c]))
export const clusterByAnchor = new Map(galleryClusters.map((c) => [c.anchor, c]))
