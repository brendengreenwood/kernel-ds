import * as React from "react"
import { cn } from "@/lib/utils"
import { typeStyles } from "@/lib/type-styles"

/** Section wrapper — eyebrow, title, lead, then content. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 pt-16 first:pt-8">
      <p className={cn(typeStyles.overline, "text-primary")}>{eyebrow}</p>
      <h2 className={cn("mt-3", typeStyles.pageTitle)}>{title}</h2>
      {lead ? (
        <p className={cn("mt-3 max-w-2xl text-muted-foreground", typeStyles.body)}>
          {lead}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  )
}

/** Group header inside the component gallery. */
export function GroupHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mt-14 border-t pt-5 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className={typeStyles.cardTitle}>{title}</h3>
      <p className={cn("mt-1 text-muted-foreground", typeStyles.bodySmall)}>{sub}</p>
    </div>
  )
}

/** Labeled subhead above a single component demo. `id` makes it a side-rail anchor. */
export function Subhead({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h4 id={id} className={cn("mt-9 mb-4 scroll-mt-20", typeStyles.overline)}>
      {children}
    </h4>
  )
}

/**
 * Component lifecycle pill (decision 0006). A third taxonomy, deliberately
 * distinct from domain StatusBadge hues and notification variants: quiet
 * outline treatment so it reads as docs metadata, not product state.
 */
export function MaturityPill({ maturity }: { maturity: "experimental" | "ready" | "deprecated" }) {
  if (maturity === "ready") return null
  return (
    <span
      data-maturity={maturity}
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm border px-1 py-px font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em]",
        maturity === "experimental" &&
          "border-warning-300 text-warning-800 dark:border-warning-800/60 dark:text-warning-200",
        maturity === "deprecated" &&
          "border-error-300 text-error-700 line-through dark:border-error-800/60 dark:text-error-300"
      )}
    >
      {maturity === "experimental" ? "exp" : "dep"}
    </span>
  )
}

/** Neutral surface that a component demo sits on. */
export function Demo({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border bg-card p-8",
        className
      )}
    >
      {children}
    </div>
  )
}
