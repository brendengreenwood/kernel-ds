/**
 * OnThisPage — a sticky "On this page" section nav for component doc pages.
 * It lists the doc sections that actually render for a component (derived
 * from the same source the renderer uses, via `docSectionNav`, so the two
 * never drift) and highlights the section currently in view.
 *
 * Placement is the caller's job. On the component page it floats in a sticky
 * rail beside the `max-w-4xl` doc column and is hidden on narrower viewports
 * where there is no room for a second column — the page reads fine without it.
 */
import * as React from "react"
import type { ComponentDoc } from "@/lib/component-docs/schema"
import { docSectionNav } from "@/components/portal/component-doc-sections"
import { cn } from "@kernel/ui/utils"
import { typeStyles } from "@/lib/type-styles"

/** Scroll-spy: track which section id is currently the topmost in view. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(ids[0] ?? null)

  React.useEffect(() => {
    if (ids.length === 0) return
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    // Track visibility ratios per id; the topmost visible section wins.
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }
        // Choose the first id (in document order) that is currently visible.
        const topmost = ids.find((id) => visible.has(id))
        if (topmost) setActive(topmost)
      },
      // Bias the viewport upward so a section counts as "active" once its
      // heading clears the sticky header, and before it fully leaves.
      { rootMargin: "-96px 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [ids])

  return active
}

export function OnThisPage({
  doc,
  className,
}: {
  doc: ComponentDoc
  className?: string
}) {
  const sections = React.useMemo(() => docSectionNav(doc), [doc])
  const ids = React.useMemo(() => sections.map((s) => s.id), [sections])
  const active = useActiveSection(ids)

  // Nothing to navigate for minimal-conformance entities, or a single
  // section (a nav of one is noise).
  if (sections.length < 2) return null

  return (
    <nav
      aria-label="On this page"
      data-slot="on-this-page"
      className={cn("text-sm", className)}
    >
      <p className={cn("mb-3", typeStyles.overline)}>
        On this page
      </p>
      <ul className="space-y-0.5 border-l">
        {sections.map((s) => {
          const isActive = s.id === active
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 pl-3 leading-snug transition-colors",
                  isActive
                    ? "border-l-primary font-medium text-foreground"
                    : "border-l-transparent text-muted-foreground hover:border-l-border hover:text-foreground",
                )}
              >
                {s.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
