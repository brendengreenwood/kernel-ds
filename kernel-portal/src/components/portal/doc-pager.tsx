import { Link, useLocation } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { typeStyles } from "@/lib/type-styles"
import { neighbors, type DocPage } from "@/lib/page-order"

/**
 * DocPager — the sequential prev/next control at the foot of every doc page.
 *
 * A mobile documentation-portal pattern: it turns the whole portal into a
 * linear read (walk the rail without opening it) and gives thumbs a big,
 * always-present target. Mobile-first — cards stack full-width and go
 * side-by-side from `sm`. Order comes from `page-order.ts`.
 */
export function DocPager() {
  const { pathname } = useLocation()
  const { prev, next } = neighbors(pathname)
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Pager"
      className="mt-16 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? <PagerCard dir="prev" page={prev} /> : <span className="hidden sm:block" />}
      {next ? <PagerCard dir="next" page={next} /> : null}
    </nav>
  )
}

function PagerCard({ dir, page }: { dir: "prev" | "next"; page: DocPage }) {
  const isNext = dir === "next"
  return (
    <Link
      to={page.path}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-ring hover:bg-accent/40 active:bg-accent/60",
        isNext && "sm:justify-end sm:text-right"
      )}
    >
      {!isNext && (
        <ChevronLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
      )}
      <span className="min-w-0">
        <span className={cn("block", typeStyles.overline)}>{isNext ? "Next" : "Previous"}</span>
        <span className="mt-0.5 block truncate font-medium">{page.title}</span>
      </span>
      {isNext && (
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  )
}
