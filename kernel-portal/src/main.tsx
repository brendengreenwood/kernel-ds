import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import PortalLayout from "@/pages/portal-layout"
import WorkspacePage from "@/pages/workspace"
import ComponentsIndex from "@/pages/components-index"
import ComponentPage from "@/pages/component-page"
import StudioPage from "@/pages/studio"
import { routeForAnchor } from "@/lib/routes"

import { OverviewSection } from "@/components/portal/overview"
import { ColorsSection, TypographySection, SpacingSection, ShadowsSection } from "@/components/portal/foundations"
import { MotionSection } from "@/components/portal/motion-foundation"
import { FormElementsSection } from "@/components/portal/form-elements"
import { TablesSection } from "@/components/portal/tables"
import { ChartsSection } from "@/components/portal/charts"
import { BorderBeamSection } from "@/components/portal/border-beam-demo"
import { AppShellSection } from "@/components/portal/app-shell"
import { NavPatternsSection } from "@/components/portal/nav-patterns"
import { DashboardSection } from "@/components/portal/dashboard"
import { FiltersSection } from "@/components/portal/filters"
import { FilteringAdvancedSection } from "@/components/portal/filtering-advanced"
import { PatternsSection } from "@/components/portal/patterns"
import { FlowsSection } from "@/components/portal/flows"
import { OriginationSection } from "@/components/portal/origination"
import { PricingSection } from "@/components/portal/pricing"
import { ModalPatternsSection } from "@/components/portal/modal-patterns"
import { ContractDetailSection } from "@/components/portal/contract-detail"
import { SettlementSection } from "@/components/portal/settlement"
import { InstallSection } from "@/components/portal/install"
import { StatusSection } from "@/components/portal/status-page"
import { SubstrateSection } from "@/components/portal/objects/substrate"
import { ShellSection } from "@/components/portal/objects/shell"
import { WorkspaceObjectSection } from "@/components/portal/objects/workspace-obj"
import "./index.css"

/**
 * A bookmark from the old single-page portal arrives as `/#anchor`
 * (e.g. `/#colors`, `/#c-button`). React Router ignores the hash for
 * routing, so translate it to the per-page route once, on load.
 */
function LegacyHashRedirect() {
  const { pathname, hash } = useLocation()
  if (pathname === "/" && hash) {
    const target = routeForAnchor(hash.slice(1))
    if (target !== "/") return <Navigate to={target} replace />
  }
  return null
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserRouter>
        <LegacyHashRedirect />
        <Routes>
          <Route path="/" element={<PortalLayout />}>
            <Route index element={<OverviewSection />} />
            <Route path="install" element={<InstallSection />} />
            <Route path="status" element={<StatusSection />} />
            <Route path="colors" element={<ColorsSection />} />
            <Route path="typography" element={<TypographySection />} />
            <Route path="spacing" element={<SpacingSection />} />
            <Route path="shadows" element={<ShadowsSection />} />
            <Route path="motion" element={<MotionSection />} />
            <Route path="components" element={<ComponentsIndex />} />
            <Route path="components/:slug" element={<ComponentPage />} />
            <Route path="forms" element={<FormElementsSection />} />
            <Route path="tables" element={<TablesSection />} />
            <Route path="charts" element={<ChartsSection />} />
            <Route path="border-beam" element={<BorderBeamSection />} />
            <Route path="appshell" element={<AppShellSection />} />
            <Route path="navigation" element={<NavPatternsSection />} />
            <Route path="dashboard" element={<DashboardSection />} />
            <Route path="filters" element={<FiltersSection />} />
            <Route path="filtering-advanced" element={<FilteringAdvancedSection />} />
            <Route path="patterns" element={<PatternsSection />} />
            <Route path="flows" element={<FlowsSection />} />
            <Route path="origination" element={<OriginationSection />} />
            <Route path="pricing" element={<PricingSection />} />
            <Route path="modals" element={<ModalPatternsSection />} />
            <Route path="contract" element={<ContractDetailSection />} />
            <Route path="settlement" element={<SettlementSection />} />
            <Route path="substrate" element={<SubstrateSection />} />
            <Route path="shell" element={<ShellSection />} />
            <Route path="workspace-obj" element={<WorkspaceObjectSection />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
)
