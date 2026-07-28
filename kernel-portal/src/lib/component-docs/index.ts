/**
 * Component-docs barrel — the single registry of component doc entities.
 *
 * `componentDocs` is keyed by gallery slug; the parity gate
 * (`scripts/check-component-docs.mjs`) and the portal renderer
 * (`ComponentDocSections`) both read from this map. Adding a component's
 * documentation means authoring a `<slug>.ts` entity and registering it here.
 */
import type { ComponentDoc } from "./schema.ts"
import { accordionDoc } from "./accordion.ts"
import { advancedFilteringDoc } from "./advanced-filtering.ts"
import { alertDoc } from "./alert.ts"
import { alertDialogDoc } from "./alert-dialog.ts"
import { animatedNumberDoc } from "./animated-number.ts"
import { appShellDoc } from "./app-shell.ts"
import { aspectRatioDoc } from "./aspect-ratio.ts"
import { attachmentDoc } from "./attachment.ts"
import { avatarDoc } from "./avatar.ts"
import { badgeDoc } from "./badge.ts"
import { borderBeamDoc } from "./border-beam.ts"
import { breadcrumbDoc } from "./breadcrumb.ts"
import { bubbleDoc } from "./bubble.ts"
import { buttonDoc } from "./button.ts"
import { calendarDoc } from "./calendar.ts"
import { cardDoc } from "./card.ts"
import { carouselDoc } from "./carousel.ts"
import { chartDoc } from "./chart.ts"
import { chartsDoc } from "./charts.ts"
import { checkboxDoc } from "./checkbox.ts"
import { clusterbadgeDoc } from "./clusterbadge.ts"
import { collapsibleDoc } from "./collapsible.ts"
import { comboboxDoc } from "./combobox.ts"
import { commandDoc } from "./command.ts"
import { commodityTagsDoc } from "./commodity-tags.ts"
import { contextMenuDoc } from "./context-menu.ts"
import { crudPatternsDoc } from "./crud-patterns.ts"
import { dashboardDoc } from "./dashboard.ts"
import { dataTableDoc } from "./data-table.ts"
import { datePickerDoc } from "./date-picker.ts"
import { dialogDoc } from "./dialog.ts"
import { drawerDoc } from "./drawer.ts"
import { dropdownMenuDoc } from "./dropdown-menu.ts"
import { filteringDoc } from "./filtering.ts"
import { flowsDoc } from "./flows.ts"
import { formDoc } from "./form.ts"
import { formElementsDoc } from "./form-elements.ts"
import { hoverCardDoc } from "./hover-card.ts"
import { inputDoc } from "./input.ts"
import { inputOtpDoc } from "./input-otp.ts"
import { labelDoc } from "./label.ts"
import { legendswatchDoc } from "./legendswatch.ts"
import { markerDoc } from "./marker.ts"
import { menubarDoc } from "./menubar.ts"
import { messageDoc } from "./message.ts"
import { messageScrollerDoc } from "./message-scroller.ts"
import { modalsDoc } from "./modals.ts"
import { navigationDoc } from "./navigation.ts"
import { navigationMenuDoc } from "./navigation-menu.ts"
import { originationFlowDoc } from "./origination-flow.ts"
import { paginationDoc } from "./pagination.ts"
import { pinDoc } from "./pin.ts"
import { plotDoc } from "./plot.ts"
import { popoverDoc } from "./popover.ts"
import { pricingWorksheetDoc } from "./pricing-worksheet.ts"
import { progressDoc } from "./progress.ts"
import { radioGroupDoc } from "./radio-group.ts"
import { scrollAreaDoc } from "./scroll-area.ts"
import { selectDoc } from "./select.ts"
import { separatorDoc } from "./separator.ts"
import { sheetDoc } from "./sheet.ts"
import { sidebarDoc } from "./sidebar.ts"
import { skeletonDoc } from "./skeleton.ts"
import { sliderDoc } from "./slider.ts"
import { sonnerDoc } from "./sonner.ts"
import { spinnerDoc } from "./spinner.ts"
import { statusBadgeDoc } from "./status-badge.ts"
import { switchDoc } from "./switch.ts"
import { tableDoc } from "./table.ts"
import { tablesDoc } from "./tables.ts"
import { tabsDoc } from "./tabs.ts"
import { textareaDoc } from "./textarea.ts"
import { toggleDoc } from "./toggle.ts"
import { toggleGroupDoc } from "./toggle-group.ts"
import { tooltipDoc } from "./tooltip.ts"

export const componentDocs: Record<string, ComponentDoc> = {
  [accordionDoc.slug]: accordionDoc,
  [advancedFilteringDoc.slug]: advancedFilteringDoc,
  [alertDoc.slug]: alertDoc,
  [alertDialogDoc.slug]: alertDialogDoc,
  [animatedNumberDoc.slug]: animatedNumberDoc,
  [appShellDoc.slug]: appShellDoc,
  [aspectRatioDoc.slug]: aspectRatioDoc,
  [attachmentDoc.slug]: attachmentDoc,
  [avatarDoc.slug]: avatarDoc,
  [badgeDoc.slug]: badgeDoc,
  [borderBeamDoc.slug]: borderBeamDoc,
  [breadcrumbDoc.slug]: breadcrumbDoc,
  [bubbleDoc.slug]: bubbleDoc,
  [buttonDoc.slug]: buttonDoc,
  [calendarDoc.slug]: calendarDoc,
  [cardDoc.slug]: cardDoc,
  [carouselDoc.slug]: carouselDoc,
  [chartDoc.slug]: chartDoc,
  [chartsDoc.slug]: chartsDoc,
  [checkboxDoc.slug]: checkboxDoc,
  [clusterbadgeDoc.slug]: clusterbadgeDoc,
  [collapsibleDoc.slug]: collapsibleDoc,
  [comboboxDoc.slug]: comboboxDoc,
  [commandDoc.slug]: commandDoc,
  [commodityTagsDoc.slug]: commodityTagsDoc,
  [contextMenuDoc.slug]: contextMenuDoc,
  [crudPatternsDoc.slug]: crudPatternsDoc,
  [dashboardDoc.slug]: dashboardDoc,
  [dataTableDoc.slug]: dataTableDoc,
  [datePickerDoc.slug]: datePickerDoc,
  [dialogDoc.slug]: dialogDoc,
  [drawerDoc.slug]: drawerDoc,
  [dropdownMenuDoc.slug]: dropdownMenuDoc,
  [filteringDoc.slug]: filteringDoc,
  [flowsDoc.slug]: flowsDoc,
  [formDoc.slug]: formDoc,
  [formElementsDoc.slug]: formElementsDoc,
  [hoverCardDoc.slug]: hoverCardDoc,
  [inputDoc.slug]: inputDoc,
  [inputOtpDoc.slug]: inputOtpDoc,
  [labelDoc.slug]: labelDoc,
  [legendswatchDoc.slug]: legendswatchDoc,
  [markerDoc.slug]: markerDoc,
  [menubarDoc.slug]: menubarDoc,
  [messageDoc.slug]: messageDoc,
  [messageScrollerDoc.slug]: messageScrollerDoc,
  [modalsDoc.slug]: modalsDoc,
  [navigationDoc.slug]: navigationDoc,
  [navigationMenuDoc.slug]: navigationMenuDoc,
  [originationFlowDoc.slug]: originationFlowDoc,
  [paginationDoc.slug]: paginationDoc,
  [pinDoc.slug]: pinDoc,
  [plotDoc.slug]: plotDoc,
  [popoverDoc.slug]: popoverDoc,
  [pricingWorksheetDoc.slug]: pricingWorksheetDoc,
  [progressDoc.slug]: progressDoc,
  [radioGroupDoc.slug]: radioGroupDoc,
  [scrollAreaDoc.slug]: scrollAreaDoc,
  [selectDoc.slug]: selectDoc,
  [separatorDoc.slug]: separatorDoc,
  [sheetDoc.slug]: sheetDoc,
  [sidebarDoc.slug]: sidebarDoc,
  [skeletonDoc.slug]: skeletonDoc,
  [sliderDoc.slug]: sliderDoc,
  [sonnerDoc.slug]: sonnerDoc,
  [spinnerDoc.slug]: spinnerDoc,
  [statusBadgeDoc.slug]: statusBadgeDoc,
  [switchDoc.slug]: switchDoc,
  [tableDoc.slug]: tableDoc,
  [tablesDoc.slug]: tablesDoc,
  [tabsDoc.slug]: tabsDoc,
  [textareaDoc.slug]: textareaDoc,
  [toggleDoc.slug]: toggleDoc,
  [toggleGroupDoc.slug]: toggleGroupDoc,
  [tooltipDoc.slug]: tooltipDoc,
}

/** Look up a component doc by its gallery slug. Returns undefined if absent. */
export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs[slug]
}

export type { ComponentDoc } from "./schema.ts"
