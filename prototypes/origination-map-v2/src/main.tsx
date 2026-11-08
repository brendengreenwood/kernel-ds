import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@app/lib/theme"
import { Shell } from "@app/components/shell"
import { PersonaProvider } from "@app/lib/persona"
import HomePage from "@app/pages/home"
import DrawAreasPage from "@app/pages/draw-areas"
import CropTonnagePage from "@app/pages/crop-tonnage"
import DataModelPage from "@app/pages/data-model"
import ScenariosPage from "@app/pages/scenarios"
import ProducersPage from "@app/pages/producers"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <PersonaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="scenarios/:id" element={<ScenariosPage />} />
            <Route path="producers" element={<ProducersPage />} />
            <Route path="map" element={<DrawAreasPage />} />
            <Route path="tonnage" element={<CropTonnagePage />} />
            <Route path="model" element={<DataModelPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </PersonaProvider>
    </ThemeProvider>
  </StrictMode>,
)
