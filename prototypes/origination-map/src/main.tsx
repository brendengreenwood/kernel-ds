import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@app/lib/theme"
import { Shell } from "@app/components/shell"
import DrawAreasPage from "@app/pages/draw-areas"
import CropTonnagePage from "@app/pages/crop-tonnage"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<DrawAreasPage />} />
            <Route path="tonnage" element={<CropTonnagePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
