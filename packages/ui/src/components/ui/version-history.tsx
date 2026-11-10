import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * VersionHistory — the saves of one object, newest first.
 *
 * Every row is a version of the same object, so nothing here links to a
 * different record. Mark the version in effect with `current`; it sets
 * `aria-current` and lifts the label out of the muted tone.
 *
 *   <VersionHistory>
 *     <VersionHistoryItem current>
 *       <VersionHistoryLabel>v4</VersionHistoryLabel>
 *       <VersionHistorySummary>Posted Bid Date refreshed</VersionHistorySummary>
 *       <VersionHistoryMeta>Nov 6</VersionHistoryMeta>
 *     </VersionHistoryItem>
 *   </VersionHistory>
 */
function VersionHistory({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      role="list"
      data-slot="version-history"
      className={cn("grid text-sm", className)}
      {...props}
    />
  )
}

function VersionHistoryItem({
  current = false,
  className,
  ...props
}: React.ComponentProps<"li"> & { current?: boolean }) {
  return (
    <li
      data-slot="version-history-item"
      data-current={current ? "" : undefined}
      aria-current={current ? "true" : undefined}
      className={cn(
        "group/version flex items-baseline gap-4 border-b py-3 last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function VersionHistoryLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="version-history-label"
      className={cn(
        "shrink-0 tabular-nums text-muted-foreground group-data-[current]/version:font-medium group-data-[current]/version:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function VersionHistorySummary({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="version-history-summary"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function VersionHistoryMeta({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="version-history-meta"
      className={cn("shrink-0 tabular-nums text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  VersionHistory,
  VersionHistoryItem,
  VersionHistoryLabel,
  VersionHistorySummary,
  VersionHistoryMeta,
}
