import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@app/components/shell"

/** The workspace shell.
 *
 *  The page shell puts one plate on the canvas and scrolls a document inside
 *  it. A workspace is a different shape: the work is a single object, it fills
 *  the viewport, and nothing scrolls but the lists beside it. So the body is
 *  laid out rather than flowed, and the elevation ladder does the explaining:
 *
 *    rail + navigator   on the canvas, recessed — they CHOOSE the work
 *    canvas plate       the one raised surface — it IS the work
 *    dock               above the plate, casting onto it — it ACTS on the work
 *
 *  Navigator before, dock after. The asymmetry is the point: chrome that picks
 *  a subject sits under it, chrome that edits the subject sits over it.
 *
 *  The activity rail is the same component the page shell uses — the app's
 *  identity does not change because the body did. The navigator is a sibling
 *  of the inset rather than a child, which is what keeps it at canvas level:
 *  a child would be ON the plate, and the plate is the map. */
export function WorkspaceShell() {
  return (
    <TooltipProvider>
      {/* Full height, no page scroll: the workspace is a fixed frame, and the
          only scrolling regions are the navigator's list and the dock's body. */}
      <SidebarProvider className="h-svh min-h-0 overflow-hidden">
        <AppSidebar />
        <Outlet />
      </SidebarProvider>
    </TooltipProvider>
  )
}
