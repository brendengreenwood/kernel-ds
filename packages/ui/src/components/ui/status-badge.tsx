import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * StatusBadge — persistent lifecycle state for a scenario, producer bid, or
 * contract.
 *
 * Distinct from <Badge variant="success | warning | …">, which signals the
 * *outcome* of a momentary event. A status is a stable state an object sits in;
 * each maps to a `--status-*` token on its own hue so a column of them stays
 * scannable. The leading dot carries the color; the soft fill keeps rows calm.
 *
 * Three domain lifecycles share the one ledger (decision 0092):
 *   scenario      draft → published → archived · expired when the window ends
 *   producer bid  pending → accepted | rejected | expired
 *   contract      booked → in_transit → delivered → settled · cancelled exits
 *
 *   <StatusBadge status="in_transit" />
 *   <StatusBadge status="settled">Paid in full</StatusBadge>
 */
const statusBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border py-0.5 pl-2 pr-2.5 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      status: {
        draft:
          "border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-100",
        published:
          "border-viz-sky-200 bg-viz-sky-100 text-viz-sky-800 dark:border-viz-sky-800/50 dark:bg-viz-sky-900/45 dark:text-viz-sky-100",
        archived:
          "border-viz-clay-200 bg-viz-clay-100 text-viz-clay-900 dark:border-viz-clay-800/50 dark:bg-viz-clay-900/45 dark:text-viz-clay-100",
        pending:
          "border-info-200 bg-info-100 text-info-800 dark:border-info-800/50 dark:bg-info-900/45 dark:text-info-100",
        accepted:
          "border-viz-crop-200 bg-viz-crop-100 text-viz-crop-800 dark:border-viz-crop-800/50 dark:bg-viz-crop-900/45 dark:text-viz-crop-100",
        booked:
          "border-viz-plum-200 bg-viz-plum-100 text-viz-plum-800 dark:border-viz-plum-800/50 dark:bg-viz-plum-900/45 dark:text-viz-plum-100",
        in_transit:
          "border-warning-200 bg-warning-100 text-warning-900 dark:border-warning-800/50 dark:bg-warning-900/45 dark:text-warning-100",
        delivered:
          "border-viz-teal-200 bg-viz-teal-100 text-viz-teal-800 dark:border-viz-teal-800/50 dark:bg-viz-teal-900/45 dark:text-viz-teal-100",
        settled:
          "border-success-200 bg-success-100 text-success-800 dark:border-success-800/50 dark:bg-success-900/45 dark:text-success-100",
        rejected:
          "border-error-200 bg-error-100 text-error-800 dark:border-error-800/50 dark:bg-error-900/45 dark:text-error-100",
        cancelled:
          "border-viz-slate-200 bg-viz-slate-100 text-viz-slate-800 dark:border-viz-slate-800/50 dark:bg-viz-slate-900/45 dark:text-viz-slate-100",
        expired:
          "border-viz-rust-200 bg-viz-rust-100 text-viz-rust-800 dark:border-viz-rust-800/50 dark:bg-viz-rust-900/45 dark:text-viz-rust-100",
      },
    },
    defaultVariants: { status: "draft" },
  }
)

export type Status = NonNullable<
  VariantProps<typeof statusBadgeVariants>["status"]
>

const dotColor: Record<Status, string> = {
  draft: "bg-neutral-500",
  published: "bg-viz-sky-500",
  archived: "bg-viz-clay-500",
  pending: "bg-info-500",
  accepted: "bg-viz-crop-500",
  booked: "bg-viz-plum-500",
  in_transit: "bg-warning-500",
  delivered: "bg-viz-teal-500",
  settled: "bg-success-500",
  rejected: "bg-error-500",
  cancelled: "bg-viz-slate-500",
  expired: "bg-viz-rust-500",
}

const defaultLabel: Record<Status, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  pending: "Pending",
  accepted: "Accepted",
  booked: "Booked",
  in_transit: "In transit",
  delivered: "Delivered",
  settled: "Settled",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
}

function StatusBadge({
  status = "draft",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants>) {
  const key = (status ?? "draft") as Status
  return (
    <span
      data-slot="status-badge"
      data-status={key}
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotColor[key])} />
      {children ?? defaultLabel[key]}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
