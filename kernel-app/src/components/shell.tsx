import * as React from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  ChevronsUpDown,
  FileText,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  Sprout,
  Users,
} from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BottomNav } from "@app/components/bottom-nav"
import { ModeToggle } from "@app/components/mode-toggle"
import { cn } from "@/lib/utils"

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const primary: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Scenarios", to: "/scenarios", icon: ListChecks },
  { label: "Producers", to: "/producers", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
]

const secondary: Item[] = [
  { label: "Support", to: "/support", icon: Handshake },
  { label: "Documentation", to: "/docs", icon: FileText },
]

/* One definition of a rail control's geometry, shared by the nav items and the
   search slot — they have to agree exactly or the rail's rhythm breaks at one
   width and not the other. See the note at its use site in Nav. */
const RAIL_CONTROL =
  "h-10 gap-3 text-base [&_svg]:size-5 [&_svg]:text-[var(--rail-icon)]"

/** Search occupies a rail slot at BOTH widths — a field when there is room for
    one, a square icon control when there isn't. It used to simply vanish on
    collapse, which dropped ~43px out of the header and yanked every nav item
    up the page. Collapsed, clicking it reopens the rail and puts the cursor in
    the field, so the control still does its job at 3.5rem.

    The field is 38px (`--control-h`, the Input default) against the nav
    button's 38.4px — the two forms are the same slot to within half a pixel,
    so the swap costs no vertical movement. */
function SearchSlot() {
  const { state, setOpen } = useSidebar()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wantFocus = React.useRef(false)

  // Focus after the rail has actually expanded, not on click: while collapsed
  // the field is `display: none`, and a hidden element cannot take focus.
  React.useEffect(() => {
    if (state === "expanded" && wantFocus.current) {
      wantFocus.current = false
      inputRef.current?.focus()
    }
  }, [state])

  return (
    <>
      <div className="px-1 group-data-[collapsible=icon]:hidden">
        {/* The trough sits on this inner wrapper so it hugs the field exactly —
            the outer div's px-1 would otherwise stretch the well past it. */}
        <div data-v2-trough className="relative rounded-lg">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search…"
            className="pl-9 text-[13px]"
            aria-label="Search"
          />
        </div>
      </div>
      <SidebarMenu className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Search"
            aria-label="Search"
            className={RAIL_CONTROL}
            onClick={() => {
              wantFocus.current = true
              setOpen(true)
            }}
          >
            <Search />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}

function Nav({ items }: { items: Item[] }) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to))
  return (
    <SidebarMenu>
      {items.map((it) => (
        // The active marker lives on the ITEM, not the button: the DS sets
        // overflow-hidden on the button, so anything in the gutter would be
        // clipped. The li is already `relative` with overflow visible, and the
        // group's 7.68px padding leaves room for a pill at -1.5 (5.76px) — out
        // past the chip's edge with a hair of gap. It is the one place the rail
        // keeps colour: a neutral chip carries the surface, `--sidebar-primary`
        // marks which item you are on.
        <SidebarMenuItem
          key={it.to}
          className={cn(
            "relative",
            isActive(it.to) &&
              "before:absolute before:top-1/2 before:-left-1.5 before:h-4 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-sidebar-primary"
          )}
        >
          <SidebarMenuButton
            isActive={isActive(it.to)}
            tooltip={it.label}
            // Collapsed geometry — the square size-10 button, p-2.5, and the
            // 3.5rem rail — is the DS's own now (register 5.8, promoted), so
            // the app only sizes the glyph and tints it.
            // Glyphs sit at neutral-300 rather than the rail's near-white
            // foreground; the ACTIVE item's steps back up, so the icon carries
            // some of the selected state instead of leaving it all to the chip.
            className={cn(RAIL_CONTROL, isActive(it.to) && "[&_svg]:text-sidebar-foreground")}
            render={
              <Link to={it.to} onClick={() => isMobile && setOpenMobile(false)}>
                <it.icon />
                <span>{it.label}</span>
              </Link>
            }
          />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

/** Exported for the workspace shell, which composes this same activity rail
    against a different body — a navigator and a canvas plate rather than a
    scrolling page. The rail is the app's identity and does not change between
    the two, so there is one of it. */
export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Beside the sidebar, the rail's first row shares a band with the page
          title: the page content is inset md:pt-8 from the panel top, so the
          header takes the matching top inset (its own p-2 plus the logo row's
          py-1 make up the rest). Below md the sidebar is offcanvas, so there is
          nothing to align to and the DS default stands. */}
      <SidebarHeader className="gap-2 md:pt-6">
        {/* Collapsed the rail is 3.5rem — one slot wide. The brand and theme
            toggle stand down and the trigger takes the slot, so the way back
            out is always visible (Cmd/Ctrl+B and the rail edge also work).
            Those two hide outright rather than fading like the nav labels do: a
            wordmark has no 3.5rem form to shrink into, so a crossfade would read
            as a glitch rather than a transition. Search is the opposite case —
            it does have one, so it keeps its slot (see SearchSlot). */}
        {/* min-h-12 = one rail slot (38.4px) plus this row's own py-1 (7.68px),
            because min-height is border-box. Without it the row is sized by its
            tallest child, which collapsed means the trigger rather than the
            theme toggle — 6px shorter, and every nav item below shifted by that
            much. Pinning the row makes the header identical at both widths. */}
        <div className="flex min-h-12 items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
            <Sprout className="size-[18px]" />
          </span>
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Kernel
          </span>
          <div className="ml-auto group-data-[collapsible=icon]:hidden">
            <ModeToggle />
          </div>
          <SidebarTrigger className="text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:ml-0" />
        </div>
        <SearchSlot />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Nav items={primary} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroupContent>
          <Nav items={secondary} />
        </SidebarGroupContent>
        <button
          title="Rivergrain Co."
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-sidebar-accent/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground">
              RG
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium group-data-[collapsible=icon]:hidden">
            Rivergrain Co.
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

/** Fades each route in on arrival. `key={pathname}` is what makes it replay:
    React remounts the subtree on every route change, so the enter animation
    runs again rather than only on first paint.

    Enter only. A true crossfade needs the outgoing page kept mounted while the
    incoming one arrives, which is a routing-library concern (and would mean two
    pages briefly overlapping in the layout) — not worth it for a fade this
    short. Opacity alone, no drift: the sidebar's own label fade already
    established the app's transition language, and a page that slides as well as
    fades starts to feel like a slideshow.

    The wrapper carries `flex flex-1 flex-col` so it is transparent to layout —
    the pages were direct flex children of the inset `main` before this and must
    remain equivalent ones. Verified against a captured baseline: identical main
    heights, card heights and content widths on all four routes.

    Inherits the `prefers-reduced-motion` guard, which zeroes animation-duration.
*/
function PageFade() {
  const { pathname } = useLocation()
  return (
    <div
      key={pathname}
      className="flex w-full flex-1 flex-col animate-in fade-in duration-[var(--duration-base)] ease-[var(--ease-out)]"
    >
      <Outlet />
    </div>
  )
}

/** Jump to top on navigation. */
function ScrollTop() {
  const { pathname } = useLocation()
  // Block body on purpose: in Chrome 151+ `scrollTo` returns a scroll-completion
  // Promise, and a concise body would hand that Promise to React as the effect's
  // cleanup function ("destroy is not a function" on the next navigation).
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* ── The rail follows the route ─────────────────────────────────────
   A workspace already has a navigator, and two columns of chrome side by
   side is one too many: the rail moves you between sections, the navigator
   moves you within one, and inside a scenario only the second question is
   live. So the rail collapses on the way in.

   It restores what it found on the way out, not a hardcoded `true` — if you
   were working with the rail collapsed before you opened a scenario, coming
   back should not expand it at you. The remembered value is only written
   while we are NOT in a workspace, so a reload inside one cannot capture the
   collapsed state as a preference.

   This is a default, not a lock: the trigger still works while you are
   inside, and using it just updates what gets restored. */
/** Is the current route a workspace? Two things need this answer — the rail
 *  collapses on it, and the frame stops scrolling on it — so it is asked in
 *  one place rather than spelled twice. */
function useInWorkspace() {
  const { pathname } = useLocation()
  return /^\/scenarios\/[^/]+\/edit\/?$/.test(pathname)
}

function RailFollowsRoute() {
  const { open, setOpen } = useSidebar()
  const inWorkspace = useInWorkspace()
  // `null` until the rail has been set once. Seeding this with `inWorkspace`
  // made the first effect a no-op, so landing directly on a workspace URL - a
  // deep link, a refresh, a shared link - left the rail expanded beside a
  // navigator. The first run must always apply.
  const was = React.useRef<boolean | null>(null)
  const remembered = React.useRef(open)

  // Capture the preference only on renders that are entirely outside a
  // workspace — not on the one that is arriving back from it. On the way out
  // this render runs BEFORE the effect restores the rail, so `open` is still
  // the collapsed value we ourselves forced; reading it here would remember
  // the collapse as a preference and the rail would never come back.
  if (!inWorkspace && was.current !== true) remembered.current = open

  React.useEffect(() => {
    if (inWorkspace === was.current) return
    was.current = inWorkspace
    setOpen(inWorkspace ? false : remembered.current)
  }, [inWorkspace, setOpen])

  return null
}

/** The app frame. One provider, one rail, for the whole application.
 *
 *  The rail and the tooltip layer live here rather than inside each body
 *  shape, because a component that unmounts cannot animate. When the page
 *  shell and the workspace each owned a provider, moving between them tore
 *  the rail down and built a new one: the width jumped, tooltips lost their
 *  layer, and the 200ms transition the DS already ships never got to run.
 *  Hoisted, the rail is the same element across the navigation — so the
 *  collapse simply plays. */
export function AppFrame() {
  const inWorkspace = useInWorkspace()
  return (
    <TooltipProvider>
      {/* The frame changes shape, not identity. A page flows and the window
          scrolls it; a workspace is a fixed frame where only the navigator's
          list and the dock's body scroll. That is one class on the provider,
          which is exactly why the provider had to be the shared thing. */}
      <SidebarProvider
        className={cn(inWorkspace && "h-svh min-h-0 overflow-hidden")}
      >
        <RailFollowsRoute />
        <ScrollTop />
        <AppSidebar />
        <Outlet />
      </SidebarProvider>
    </TooltipProvider>
  )
}

/** The page body: one plate, with a document scrolling inside it. */
export function Shell() {
  return (
    <SidebarInset className="bg-background">
      <PageFade />
      <BottomNav />
    </SidebarInset>
  )
}
