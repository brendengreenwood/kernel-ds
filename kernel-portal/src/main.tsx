import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import PortalPage from "@/pages/portal"
import WorkspacePage from "@/pages/workspace"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortalPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
)
