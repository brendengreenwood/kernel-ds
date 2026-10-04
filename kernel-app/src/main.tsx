import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@app/components/theme-provider"
import { AppFrame, Shell } from "@app/components/shell"
import OverviewPage from "@app/pages/overview"
import ScenariosPage from "@app/pages/scenarios"
import ProducersPage from "@app/pages/producers"
import SettingsPage from "@app/pages/settings"
import { WorkspaceShell } from "@app/components/workspace-shell"
import WorkspacePage from "@app/pages/workspace"
import "./index.css"

// Dark is the app's default identity; light is available via the toggle.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <BrowserRouter>
        <Routes>
          {/* One frame, two bodies. The rail and the tooltip layer belong to
              the frame so they survive the navigation between them — a
              provider that unmounts cannot animate, and the rail collapsing
              into a workspace is the whole point. */}
          <Route element={<AppFrame />}>
            <Route element={<Shell />}>
              <Route index element={<OverviewPage />} />
              <Route path="scenarios" element={<ScenariosPage />} />
              <Route path="producers" element={<ProducersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            {/* The workspace is a different body, not a different app: the
                page body scrolls a document on the plate, and here the plate
                is a map that fills the frame. */}
            <Route element={<WorkspaceShell />}>
              <Route path="scenarios/:id/edit" element={<WorkspacePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
