import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Settings,
  Users,
} from "@/components/ui/icon"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/* Mobile navigation.
   Below `md` the DS renders the sidebar as an off-canvas Sheet — and the only
   control that opens it, `SidebarTrigger`, lives inside `SidebarHeader`, i.e.
   inside the sheet. So on a phone there was no hamburger, no rail, and no way
   to leave the page you landed on. `mobile-audit` passed the whole time because
   it measures overflow, clipping and hit areas, not reachability.

   A bottom bar rather than a hamburger because every destination is a peer:
   four routes, all top-level, all frequently switched between. A hamburger
   would hide a four-item list behind a tap for no benefit.

   The fifth slot opens the sheet. It is not a destination — it is what makes
   the sheet reachable at all, and with it the search field and org switcher
   that otherwise exist only on the rail. */

type Tab = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const tabs: Tab[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Scenarios", to: "/scenarios", icon: ListChecks },
  { label: "Producers", to: "/producers", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
]

/** Shared by the links and the sheet trigger so the row stays even. `h-14`
    (53.8px at this --spacing) clears the 44px touch floor on its own — no
    pseudo-element extension needed, unlike the compact controls in
    decision 0007. */
const TAB =
  "relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-none"

/** The active marker mirrors the rail's: a `--sidebar-primary` bar on the
    leading edge — the top edge here, since a bottom bar is entered from above.
    Colour stays out of the label itself, which keeps the rail's rule that the
    chrome is neutral and green marks position only. */
const ACTIVE_MARKER =
  "before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-full before:bg-sidebar-primary"

export function BottomNav() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))

  return (
    <nav
      aria-label="Primary"
      /* `sticky` rather than `fixed`: the inset panel is the scroll container's
         content, and a fixed bar would sit over the page plate's bottom gutter
         instead of below it. Safe-area padding keeps the row clear of the home
         indicator on notched phones. */
      className="sticky bottom-0 z-30 flex border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          aria-current={isActive(t.to) ? "page" : undefined}
          className={cn(
            TAB,
            isActive(t.to)
              ? cn("text-sidebar-foreground", ACTIVE_MARKER)
              : "text-[var(--rail-icon)]"
          )}
        >
          <t.icon className="size-5" />
          <span className="max-w-full truncate">{t.label}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        aria-label="More"
        className={cn(TAB, "text-[var(--rail-icon)]")}
      >
        <MoreHorizontal className="size-5" />
        <span>More</span>
      </button>
    </nav>
  )
}
