import * as React from "react"
import { BorderBeam, type BorderBeamProps } from "border-beam"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/**
 * Opt-in animated border beam (third-party `border-beam`, MIT) exposed as a
 * prop on Button / Input / Card. Pass `true` for the component's default
 * beam, or an options object to tune it:
 *
 *   <Button borderBeam />
 *   <Card borderBeam={{ colorVariant: "ocean", size: "pulse-inner" }} />
 *
 * The beam's light/dark `theme` follows the app theme unless overridden.
 */
export type BorderBeamProp = boolean | Omit<BorderBeamProps, "children">

/**
 * Wrap `children` with a BorderBeam when `beam` is set, else return them
 * untouched. The beam (and its `useTheme` subscription) only mounts when
 * requested, so unbeamed controls pay nothing.
 */
export function BeamWrap({
  beam,
  defaults,
  children,
}: {
  beam?: BorderBeamProp
  defaults?: Omit<BorderBeamProps, "children">
  children: React.ReactElement
}) {
  if (!beam) return children
  const opts = beam === true ? {} : beam
  return (
    <ThemedBeam opts={opts} defaults={defaults}>
      {children}
    </ThemedBeam>
  )
}

function ThemedBeam({
  opts,
  defaults,
  children,
}: {
  opts: Omit<BorderBeamProps, "children">
  defaults?: Omit<BorderBeamProps, "children">
  children: React.ReactElement
}) {
  const { resolvedTheme } = useTheme()
  const theme =
    opts.theme ?? defaults?.theme ?? (resolvedTheme === "light" ? "light" : "dark")
  return (
    <BorderBeam
      {...defaults}
      {...opts}
      theme={theme}
      className={cn(defaults?.className, opts.className)}
    >
      {children}
    </BorderBeam>
  )
}
