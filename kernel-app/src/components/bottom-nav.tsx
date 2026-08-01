import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Settings,
  Users,
} from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/* Mobile navigation.
   Below `md` the DS renders the sidebar as an off-canvas Sheet — and the only
   control that opens it, `SidebarTrigger`, lives inside `SidebarHeader`, i.e.
   inside the sheet. So on a phone there was no hamburger, no rail, and no way
   to leave the page you landed on. `mobile-audit` passed the whole time because
   it measures overflow, clipping and hit areas, not reachability.

   A bar rather than a hamburger because every destination is a peer: four
   routes, all top-level, all frequently switched between. The fifth slot is not
   a destination — it opens the sheet, which is what makes the search field and
   org switcher reachable on a phone at all.

   Icon-only, so the accessible name comes from `aria-label` rather than visible
   text. Worth being clear-eyed: dropping the labels trades a signifier for the
   compact dock shape, and four of these five glyphs are conventional enough to
   carry it — `MoreHorizontal` least so, which is the one to watch if anyone
   reports confusion.

   Built from DS primitives rather than styled elements: `Card` is the floating
   surface (so it inherits the app's plate edge + lip + cast from the
   modification layer for free, exactly like every other raised thing here), and
   each tab is a `Button` — `render={<Link/>}` for the destinations, which is
   the app's existing pattern for a button that navigates. That inheritance is
   the point: the bar picks up focus rings, coarse-pointer sizing and the
   elevation recipe without restating any of them. */

type Tab = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const tabs: Tab[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Scenarios", to: "/scenarios", icon: ListChecks },
  { label: "Producers", to: "/producers", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
]

/** Tabs divide the bar's width evenly rather than sitting at a fixed size, so
    the whole strip is tappable — at 390px that is ~68×53.8px each, well past
    the 44px floor and clearing it on their own rather than leaning on the
    coarse-pointer `min-height` from decision 0009 (which only fires on coarse
    pointers, leaving a touchscreen laptop short). `rounded-full!` beats the
    layer's button-radius rule; at this aspect the tabs are stadiums rather than
    circles, which is what filling the width costs and it reads fine. */
const TAB = "relative h-14 min-w-0 flex-1 rounded-full! p-0"

export function BottomNav() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))

  /* The chip is ONE element that slides between tabs, not a background on each
     button — a per-button fill can only cross-fade, and what reads as "the
     selection moved" is a single object travelling. It is measured off the
     active tab rather than computed from an index: the tabs are `flex-1`, so
     their width depends on the viewport, and measuring survives that without
     duplicating the layout maths.

     `useLayoutEffect` so the position is committed before paint — with a plain
     effect the chip would paint at its old position for a frame and then jump.
     The observer keeps it right through rotation and width changes. */
  const barRef = React.useRef<HTMLDivElement>(null)
  const [chip, setChip] = React.useState<{ x: number; w: number } | null>(null)

  React.useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const measure = () => {
      const el = bar.querySelector<HTMLElement>('[aria-current="page"]')
      setChip(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [pathname])

  return (
    <nav
      aria-label="Primary"
      /* Floating: `fixed` so the bar rides above the content rather than
         sitting at the end of it, inset from all three edges, and clear of the
         home indicator via the safe-area inset. The page reserves matching
         bottom padding in the modification layer so nothing hides underneath. */
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
    >
      {/* `data-v2-chrome` swaps the card's content-plate fill and hairline for
          the rail's — see the modification layer. Fully round, so the bar reads
          as a floating control rather than a panel; `px-2` keeps the outer tabs
          clear of the curve. */}
      <Card
        ref={barRef}
        data-v2-chrome
        className="relative h-auto w-full flex-row items-center gap-1 rounded-full p-1.5"
      >
        {/* The travelling chip. `aria-hidden` because `aria-current` on the tab
            already states the selection — this is its visual form only. Inset
            top/bottom by the card's own padding so it sits exactly on a tab. */}
        {chip && (
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-sidebar-accent transition-[transform,width] duration-[var(--duration-base)] ease-[var(--ease-out)] after:absolute after:bottom-2 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-sidebar-primary"
            style={{ transform: `translateX(${chip.x}px)`, width: chip.w }}
          />
        )}
        {tabs.map((t) => (
          <Button
            key={t.to}
            variant="ghost"
            aria-current={isActive(t.to) ? "page" : undefined}
            className={cn(
              TAB,
              /* Only the ink changes per tab now — the fill and the marker dot
                 both live on the travelling chip above, which is what lets them
                 slide. The chip colour is the RAIL's `--sidebar-accent`, not the
                 button's `secondary` variant: those are the same neutral in
                 dark, which is why the variant looked correct, but in light
                 `--secondary` is the pale lime, so the chip came out green and
                 colour crept into chrome. */
              isActive(t.to)
                ? "text-sidebar-accent-foreground"
                : "text-[var(--rail-icon)]"
            )}
            aria-label={t.label}
            render={<Link to={t.to} />}
          >
            <t.icon className="size-6" />
          </Button>
        ))}
        <Button
          variant="ghost"
          aria-label="More"
          onClick={() => setOpenMobile(true)}
          className={cn(TAB, "text-[var(--rail-icon)]")}
        >
          <MoreHorizontal className="size-6" />
        </Button>
      </Card>
    </nav>
  )
}
