import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Shell } from "@app/components/shell"
import OverviewPage from "@app/pages/overview"
import ScenariosPage from "@app/pages/scenarios"
import ProducersPage from "@app/pages/producers"
import SettingsPage from "@app/pages/settings"
import "./index.css"

// Dark is the app's default identity; light is available via the toggle.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<OverviewPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="producers" element={<ProducersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
