import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/portal/app-sidebar"
import { DocPager } from "@/components/portal/doc-pager"
import { ModeToggle } from "@/components/mode-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Github } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

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
  return (
    <SidebarProvider>
      <ScrollManager />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
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
        <div className="mx-auto w-full max-w-4xl px-6 pb-32 md:px-10">
          <Outlet />
          <DocPager />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
