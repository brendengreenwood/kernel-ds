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

/** Stacked icon-over-label, which the DS button sizes do not cover (they are
    horizontal), so layout is overridden while everything else about the
    primitive is kept. `h-auto` releases the size variant's fixed height; the
    padding below still clears the 44px touch floor on its own. */
const TAB =
  "h-auto min-w-0 flex-1 flex-col gap-1 rounded-full! px-1 py-2 text-[11px] leading-none font-normal"

export function BottomNav() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))

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
        data-v2-chrome
        className="h-auto w-full max-w-md flex-row items-stretch gap-1 rounded-full px-2 py-1.5"
      >
        {tabs.map((t) => (
          <Button
            key={t.to}
            variant="ghost"
            aria-current={isActive(t.to) ? "page" : undefined}
            className={cn(
              TAB,
              /* The active chip is the RAIL's `--sidebar-accent`, not the
                 button's `secondary` variant. Those are the same neutral in
                 dark, which is why the variant looked correct — but in light
                 `--secondary` is the pale lime, so the chip and its label came
                 out green and colour crept into chrome. The rail already
                 overrides `--sidebar-accent` to a neutral for exactly this
                 reason; the bar borrows it so both agree in both themes.

                 The marker mirrors the rail's `--sidebar-primary` bar, moved to
                 the top edge since a bottom bar is entered from above. Colour
                 marks position only. */
              isActive(t.to)
                ? "relative bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-sidebar-primary"
                : "text-[var(--rail-icon)]"
            )}
            render={<Link to={t.to} />}
          >
            <t.icon className="size-5" />
            <span className="max-w-full truncate">{t.label}</span>
          </Button>
        ))}
        <Button
          variant="ghost"
          aria-label="More"
          onClick={() => setOpenMobile(true)}
          className={cn(TAB, "text-[var(--rail-icon)]")}
        >
          <MoreHorizontal className="size-5" />
          <span>More</span>
        </Button>
      </Card>
    </nav>
  )
}
