import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@kernel/ui"
import { Separator } from "@kernel/ui"
import { AppSidebar } from "@/components/portal/app-sidebar"
import { DocPager } from "@/components/portal/doc-pager"
import { ModeToggle } from "@/components/mode-toggle"
import { buttonVariants } from "@kernel/ui"
import { Github } from "@kernel/ui/icon"
import { cn } from "@kernel/ui/utils"

/** On navigation, jump to top (or to the in-page anchor when the URL has a hash). */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ block: "start" })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function PortalLayout() {
  // Studio is a full-bleed canvas surface — it escapes the doc column
  // (max-w-4xl) and manages its own height/scroll; no pager either.
  const { pathname } = useLocation()
  const fullBleed = pathname === "/studio" || pathname.startsWith("/studio/")
  return (
    <SidebarProvider>
      <ScrollManager />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:rounded-t-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm text-muted-foreground">
            Kernel <span className="opacity-40">/</span>{" "}
            <span className="font-medium text-foreground">Design System</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/brendengreenwood/kernel-ds"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub repository</span>
            </a>
            <ModeToggle />
          </div>
        </header>

        {/* SidebarInset already renders the <main> landmark - keep this a div (one main per page) */}
        <div className={cn("w-full px-6 md:px-10", !fullBleed && "mx-auto max-w-4xl pb-32")}>
          <Outlet />
          {fullBleed ? null : <DocPager />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
