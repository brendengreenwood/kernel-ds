/* Canonical Kernel design-system entity inventory. */
import type { CatalogEntity } from "./schema.ts"

export const catalog = [
  {
    "id": "component.accordion",
    "name": "Accordion",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "accordion",
      "sourceFile": "kernel-portal/src/lib/component-docs/accordion.ts",
      "portalAnchor": "c-accordion"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/accordion.tsx"
    ]
  },
  {
    "id": "component.alert",
    "name": "Alert",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "alert",
      "sourceFile": "kernel-portal/src/lib/component-docs/alert.ts",
      "portalAnchor": "c-alert"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/alert.tsx"
    ],
    "note": "Kernel success/warning/info variants."
  },
  {
    "id": "component.alert-dialog",
    "name": "Alert Dialog",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "alert-dialog",
      "sourceFile": "kernel-portal/src/lib/component-docs/alert-dialog.ts",
      "portalAnchor": "c-dialog"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/alert-dialog.tsx"
    ]
  },
  {
    "id": "component.aspect-ratio",
    "name": "Aspect Ratio",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "aspect-ratio",
      "sourceFile": "kernel-portal/src/lib/component-docs/aspect-ratio.ts",
      "portalAnchor": "c-separator"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/aspect-ratio.tsx"
    ]
  },
  {
    "id": "component.attachment",
    "name": "Attachment",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "attachment",
      "sourceFile": "kernel-portal/src/lib/component-docs/attachment.ts",
      "portalAnchor": "c-attachment"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/attachment.tsx"
    ],
    "note": "Upload lifecycle carried on one `state` prop (idle/uploading/processing/error/done)."
  },
  {
    "id": "component.avatar",
    "name": "Avatar",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "avatar",
      "sourceFile": "kernel-portal/src/lib/component-docs/avatar.ts",
      "portalAnchor": "c-badge"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/avatar.tsx"
    ]
  },
  {
    "id": "component.badge",
    "name": "Badge",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "badge",
      "sourceFile": "kernel-portal/src/lib/component-docs/badge.ts",
      "portalAnchor": "c-badge"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/badge.tsx"
    ],
    "note": "Kernel success/warning/info variants."
  },
  {
    "id": "component.breadcrumb",
    "name": "Breadcrumb",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "breadcrumb",
      "sourceFile": "kernel-portal/src/lib/component-docs/breadcrumb.ts",
      "portalAnchor": "c-breadcrumb"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/breadcrumb.tsx"
    ]
  },
  {
    "id": "component.bubble",
    "name": "Bubble",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "bubble",
      "sourceFile": "kernel-portal/src/lib/component-docs/bubble.ts",
      "portalAnchor": "c-bubble"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/bubble.tsx"
    ],
    "note": "The filled surface inside a Message; seven tone variants."
  },
  {
    "id": "component.button",
    "name": "Button",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "button",
      "sourceFile": "kernel-portal/src/lib/component-docs/button.ts",
      "portalAnchor": "c-button"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/button.tsx"
    ]
  },
  {
    "id": "component.button-group",
    "name": "Button Group",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "button-group",
      "sourceFile": "kernel-portal/src/lib/component-docs/button-group.ts",
      "portalAnchor": "c-button-group"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/button-group.tsx"
    ]
  },
  {
    "id": "component.calendar",
    "name": "Calendar",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "calendar",
      "sourceFile": "kernel-portal/src/lib/component-docs/calendar.ts",
      "portalAnchor": "c-calendar"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/calendar.tsx"
    ]
  },
  {
    "id": "component.card",
    "name": "Card",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "card",
      "sourceFile": "kernel-portal/src/lib/component-docs/card.ts",
      "portalAnchor": "c-card"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/card.tsx"
    ]
  },
  {
    "id": "component.carousel",
    "name": "Carousel",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "carousel",
      "sourceFile": "kernel-portal/src/lib/component-docs/carousel.ts",
      "portalAnchor": "c-carousel"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/carousel.tsx"
    ]
  },
  {
    "id": "component.chart",
    "name": "Chart",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "chart",
      "sourceFile": "kernel-portal/src/lib/component-docs/chart.ts",
      "portalAnchor": "charts"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/chart.tsx"
    ]
  },
  {
    "id": "component.checkbox",
    "name": "Checkbox",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "checkbox",
      "sourceFile": "kernel-portal/src/lib/component-docs/checkbox.ts",
      "portalAnchor": "fe-selection"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/checkbox.tsx"
    ]
  },
  {
    "id": "component.collapsible",
    "name": "Collapsible",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "collapsible",
      "sourceFile": "kernel-portal/src/lib/component-docs/collapsible.ts",
      "portalAnchor": "c-accordion"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/collapsible.tsx"
    ]
  },
  {
    "id": "component.combobox",
    "name": "Combobox",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "combobox",
      "sourceFile": "kernel-portal/src/lib/component-docs/combobox.ts",
      "portalAnchor": "c-combobox"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/combobox.tsx"
    ]
  },
  {
    "id": "component.command",
    "name": "Command",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "command",
      "sourceFile": "kernel-portal/src/lib/component-docs/command.ts",
      "portalAnchor": "c-command"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/command.tsx"
    ]
  },
  {
    "id": "component.context-menu",
    "name": "Context Menu",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "context-menu",
      "sourceFile": "kernel-portal/src/lib/component-docs/context-menu.ts",
      "portalAnchor": "c-dropdown-menu"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/context-menu.tsx"
    ],
    "note": "Base UI behavior (documented, intended): checkbox/radio menu items stay open on click for multi-select."
  },
  {
    "id": "component.data-table",
    "name": "Data Table",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "data-table",
      "sourceFile": "kernel-portal/src/lib/component-docs/data-table.ts",
      "portalAnchor": "c-table"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/table.tsx"
    ],
    "note": "Composition: table + @tanstack/react-table."
  },
  {
    "id": "component.date-picker",
    "name": "Date Picker",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "date-picker",
      "sourceFile": "kernel-portal/src/lib/component-docs/date-picker.ts",
      "portalAnchor": "c-calendar"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/calendar.tsx",
      "packages/ui/src/components/ui/popover.tsx"
    ],
    "note": "Composition: popover + calendar."
  },
  {
    "id": "component.dialog",
    "name": "Dialog",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "dialog",
      "sourceFile": "kernel-portal/src/lib/component-docs/dialog.ts",
      "portalAnchor": "c-dialog"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/dialog.tsx"
    ]
  },
  {
    "id": "component.drawer",
    "name": "Drawer",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "drawer",
      "sourceFile": "kernel-portal/src/lib/component-docs/drawer.ts",
      "portalAnchor": "c-sheet"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/drawer.tsx"
    ]
  },
  {
    "id": "component.dropdown-menu",
    "name": "Dropdown Menu",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "dropdown-menu",
      "sourceFile": "kernel-portal/src/lib/component-docs/dropdown-menu.ts",
      "portalAnchor": "c-dropdown-menu"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/dropdown-menu.tsx"
    ],
    "note": "Base UI behavior (documented, intended): checkbox/radio menu items stay open on click for multi-select."
  },
  {
    "id": "component.empty",
    "name": "Empty",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "empty",
      "sourceFile": "kernel-portal/src/lib/component-docs/empty.ts",
      "portalAnchor": "c-empty"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/empty.tsx"
    ]
  },
  {
    "id": "component.field",
    "name": "Field",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "field",
      "sourceFile": "kernel-portal/src/lib/component-docs/field.ts",
      "portalAnchor": "c-field"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/field.tsx"
    ]
  },
  {
    "id": "component.form",
    "name": "Form",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "form",
      "sourceFile": "kernel-portal/src/lib/component-docs/form.ts",
      "portalAnchor": "c-form"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/form.tsx"
    ]
  },
  {
    "id": "component.hover-card",
    "name": "Hover Card",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "hover-card",
      "sourceFile": "kernel-portal/src/lib/component-docs/hover-card.ts",
      "portalAnchor": "c-popover"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/hover-card.tsx"
    ]
  },
  {
    "id": "component.input",
    "name": "Input",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "input",
      "sourceFile": "kernel-portal/src/lib/component-docs/input.ts",
      "portalAnchor": "c-input"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/input.tsx"
    ]
  },
  {
    "id": "component.input-otp",
    "name": "Input OTP",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "input-otp",
      "sourceFile": "kernel-portal/src/lib/component-docs/input-otp.ts",
      "portalAnchor": "c-slider"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/input-otp.tsx"
    ]
  },
  {
    "id": "component.item",
    "name": "Item",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "item",
      "sourceFile": "kernel-portal/src/lib/component-docs/item.ts",
      "portalAnchor": "c-item"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/item.tsx"
    ]
  },
  {
    "id": "component.kbd",
    "name": "Kbd",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "kbd",
      "sourceFile": "kernel-portal/src/lib/component-docs/kbd.ts",
      "portalAnchor": "c-kbd"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/kbd.tsx"
    ]
  },
  {
    "id": "component.label",
    "name": "Label",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "label",
      "sourceFile": "kernel-portal/src/lib/component-docs/label.ts",
      "portalAnchor": "fe-anatomy"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/label.tsx"
    ]
  },
  {
    "id": "component.menubar",
    "name": "Menubar",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "menubar",
      "sourceFile": "kernel-portal/src/lib/component-docs/menubar.ts",
      "portalAnchor": "c-navigation-menu"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/menubar.tsx"
    ],
    "note": "Base UI behavior (documented, intended): checkbox/radio menu items stay open on click for multi-select."
  },
  {
    "id": "component.marker",
    "name": "Marker",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "marker",
      "sourceFile": "kernel-portal/src/lib/component-docs/marker.ts",
      "portalAnchor": "c-marker"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/marker.tsx"
    ],
    "note": "Transcript dividers — date, session, unread."
  },
  {
    "id": "component.message",
    "name": "Message",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "message",
      "sourceFile": "kernel-portal/src/lib/component-docs/message.ts",
      "portalAnchor": "c-message"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/message.tsx"
    ]
  },
  {
    "id": "component.message-scroller",
    "name": "Message Scroller",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "message-scroller",
      "sourceFile": "kernel-portal/src/lib/component-docs/message-scroller.ts",
      "portalAnchor": "c-message-scroller"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/message-scroller.tsx"
    ],
    "note": "Autoscroll that yields to the operator; backed by @shadcn/react."
  },
  {
    "id": "component.native-select",
    "name": "Native Select",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "native-select",
      "sourceFile": "kernel-portal/src/lib/component-docs/native-select.ts",
      "portalAnchor": "c-native-select"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/native-select.tsx"
    ]
  },
  {
    "id": "component.navigation-menu",
    "name": "Navigation Menu",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "navigation-menu",
      "sourceFile": "kernel-portal/src/lib/component-docs/navigation-menu.ts",
      "portalAnchor": "c-navigation-menu"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/navigation-menu.tsx"
    ],
    "note": "Base UI behavior (documented, intended): hover-open delay tuned to 50ms."
  },
  {
    "id": "component.pagination",
    "name": "Pagination",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "pagination",
      "sourceFile": "kernel-portal/src/lib/component-docs/pagination.ts",
      "portalAnchor": "c-breadcrumb"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/pagination.tsx"
    ]
  },
  {
    "id": "component.popover",
    "name": "Popover",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "popover",
      "sourceFile": "kernel-portal/src/lib/component-docs/popover.ts",
      "portalAnchor": "c-popover"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/popover.tsx"
    ]
  },
  {
    "id": "component.progress",
    "name": "Progress",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "progress",
      "sourceFile": "kernel-portal/src/lib/component-docs/progress.ts",
      "portalAnchor": "c-progress"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/progress.tsx"
    ]
  },
  {
    "id": "component.radio-group",
    "name": "Radio Group",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "radio-group",
      "sourceFile": "kernel-portal/src/lib/component-docs/radio-group.ts",
      "portalAnchor": "c-radio-group"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/radio-group.tsx"
    ]
  },
  {
    "id": "component.resizable",
    "name": "Resizable",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "scroll-area",
      "sourceFile": "kernel-portal/src/lib/component-docs/scroll-area.ts",
      "portalAnchor": "c-scroll-area"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/scroll-area.tsx",
      "packages/ui/src/components/ui/resizable.tsx"
    ]
  },
  {
    "id": "component.scroll-area",
    "name": "Scroll Area",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "scroll-area",
      "sourceFile": "kernel-portal/src/lib/component-docs/scroll-area.ts",
      "portalAnchor": "c-scroll-area"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/scroll-area.tsx",
      "packages/ui/src/components/ui/resizable.tsx"
    ]
  },
  {
    "id": "component.select",
    "name": "Select",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "select",
      "sourceFile": "kernel-portal/src/lib/component-docs/select.ts",
      "portalAnchor": "c-input"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/select.tsx"
    ]
  },
  {
    "id": "component.separator",
    "name": "Separator",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "separator",
      "sourceFile": "kernel-portal/src/lib/component-docs/separator.ts",
      "portalAnchor": "c-separator"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/separator.tsx"
    ]
  },
  {
    "id": "component.sheet",
    "name": "Sheet",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "sheet",
      "sourceFile": "kernel-portal/src/lib/component-docs/sheet.ts",
      "portalAnchor": "c-sheet"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/sheet.tsx"
    ]
  },
  {
    "id": "component.sidebar",
    "name": "Sidebar",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "sidebar",
      "sourceFile": "kernel-portal/src/lib/component-docs/sidebar.ts",
      "portalAnchor": "appshell"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/sidebar.tsx"
    ],
    "note": "Demonstrated by this portal's own rail and the app shell."
  },
  {
    "id": "component.skeleton",
    "name": "Skeleton",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "skeleton",
      "sourceFile": "kernel-portal/src/lib/component-docs/skeleton.ts",
      "portalAnchor": "c-progress"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/skeleton.tsx"
    ]
  },
  {
    "id": "component.slider",
    "name": "Slider",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "slider",
      "sourceFile": "kernel-portal/src/lib/component-docs/slider.ts",
      "portalAnchor": "c-slider"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/slider.tsx"
    ]
  },
  {
    "id": "component.sonner",
    "name": "Sonner",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "sonner",
      "sourceFile": "kernel-portal/src/lib/component-docs/sonner.ts",
      "portalAnchor": "c-sonner"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/sonner.tsx"
    ]
  },
  {
    "id": "component.spinner",
    "name": "Spinner",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "spinner",
      "sourceFile": "kernel-portal/src/lib/component-docs/spinner.ts",
      "portalAnchor": "c-spinner"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/spinner.tsx"
    ],
    "note": "role=\"status\" and an accessible label ship with it."
  },
  {
    "id": "component.status-badge",
    "name": "Status Badge",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "status-badge",
      "sourceFile": "kernel-portal/src/lib/component-docs/status-badge.ts",
      "portalAnchor": "c-status-badge"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/status-badge.tsx"
    ],
    "note": "Kernel-only; domain lifecycle states (decision 0003)."
  },
  {
    "id": "component.switch",
    "name": "Switch",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "switch",
      "sourceFile": "kernel-portal/src/lib/component-docs/switch.ts",
      "portalAnchor": "fe-selection"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/switch.tsx"
    ]
  },
  {
    "id": "component.table",
    "name": "Table",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "table",
      "sourceFile": "kernel-portal/src/lib/component-docs/table.ts",
      "portalAnchor": "c-table"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/table.tsx"
    ]
  },
  {
    "id": "component.tabs",
    "name": "Tabs",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "tabs",
      "sourceFile": "kernel-portal/src/lib/component-docs/tabs.ts",
      "portalAnchor": "c-tabs"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/tabs.tsx"
    ],
    "note": "Variants pill (primary active, default) · underline · folder; sizes compact/default/comfortable (control-height tokens); slots for leading icon, <TabCount> badge, <TabDot> notification (decision 0021). Automatic activation (arrows activate; activateOnFocus overridable) — decision 0023."
  },
  {
    "id": "component.textarea",
    "name": "Textarea",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "textarea",
      "sourceFile": "kernel-portal/src/lib/component-docs/textarea.ts",
      "portalAnchor": "c-input"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/textarea.tsx"
    ]
  },
  {
    "id": "component.toggle",
    "name": "Toggle",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "toggle",
      "sourceFile": "kernel-portal/src/lib/component-docs/toggle.ts",
      "portalAnchor": "c-toggle"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/toggle.tsx"
    ]
  },
  {
    "id": "component.toggle-group",
    "name": "Toggle Group",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "toggle-group",
      "sourceFile": "kernel-portal/src/lib/component-docs/toggle-group.ts",
      "portalAnchor": "c-toggle"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/toggle-group.tsx"
    ]
  },
  {
    "id": "component.tooltip",
    "name": "Tooltip",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "tooltip",
      "sourceFile": "kernel-portal/src/lib/component-docs/tooltip.ts",
      "portalAnchor": "c-sonner"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/tooltip.tsx"
    ]
  },
  {
    "id": "element.form-elements",
    "name": "Form elements",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "form-elements",
      "sourceFile": "kernel-portal/src/lib/component-docs/form-elements.ts",
      "portalAnchor": "forms"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/form.tsx"
    ]
  },
  {
    "id": "element.tables",
    "name": "Tables",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "tables",
      "sourceFile": "kernel-portal/src/lib/component-docs/tables.ts",
      "portalAnchor": "tables"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/table.tsx"
    ]
  },
  {
    "id": "element.charts",
    "name": "Charts",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "charts",
      "sourceFile": "kernel-portal/src/lib/component-docs/charts.ts",
      "portalAnchor": "charts"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/chart.tsx"
    ]
  },
  {
    "id": "element.border-beam",
    "name": "Border beam",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "border-beam",
      "sourceFile": "kernel-portal/src/lib/component-docs/border-beam.ts",
      "portalAnchor": "border-beam"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/border-beam.tsx"
    ],
    "note": "Third-party effect (border-beam, MIT); opt-in borderBeam prop on Button/Input/Card."
  },
  {
    "id": "element.commodity-tags",
    "name": "Commodity tags",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "commodity-tags",
      "sourceFile": "kernel-portal/src/lib/component-docs/commodity-tags.ts",
      "portalAnchor": "colors"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/commodity-badge.tsx"
    ],
    "note": "Categorical --commodity-* hues (corn/canola/soybeans/wheat) + <CommodityBadge> (decision 0013)."
  },
  {
    "id": "element.animated-number",
    "name": "Animated number",
    "kind": "element",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "element",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "animated-number",
      "sourceFile": "kernel-portal/src/lib/component-docs/animated-number.ts",
      "portalAnchor": "dashboard"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/animated-number.tsx"
    ],
    "note": "<AnimatedNumber> (@number-flow/react) — counts up on mount, rolls on change, honors reduced-motion (decision 0018); used on dashboard KPIs + settlement net payable."
  },
  {
    "id": "pattern.app-shell",
    "name": "App shell",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "app-shell",
      "sourceFile": "kernel-portal/src/lib/component-docs/app-shell.ts",
      "portalAnchor": "appshell"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.navigation",
    "name": "Navigation",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "navigation",
      "sourceFile": "kernel-portal/src/lib/component-docs/navigation.ts",
      "portalAnchor": "navigation"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [],
    "note": "Module switcher + nested rail conventions for app-level navigation."
  },
  {
    "id": "pattern.dashboard",
    "name": "Dashboard",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "dashboard",
      "sourceFile": "kernel-portal/src/lib/component-docs/dashboard.ts",
      "portalAnchor": "dashboard"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.filtering",
    "name": "Filtering",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "filtering",
      "sourceFile": "kernel-portal/src/lib/component-docs/filtering.ts",
      "portalAnchor": "filters"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.advanced-filtering",
    "name": "Advanced filtering",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "advanced-filtering",
      "sourceFile": "kernel-portal/src/lib/component-docs/advanced-filtering.ts",
      "portalAnchor": "filtering-advanced"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [],
    "note": "Filter builder, column controls, and date preset patterns for dense data screens."
  },
  {
    "id": "pattern.crud-patterns",
    "name": "CRUD patterns",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "crud-patterns",
      "sourceFile": "kernel-portal/src/lib/component-docs/crud-patterns.ts",
      "portalAnchor": "patterns"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.flows",
    "name": "Flows",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "flows",
      "sourceFile": "kernel-portal/src/lib/component-docs/flows.ts",
      "portalAnchor": "flows"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.origination-flow",
    "name": "Origination flow",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "origination-flow",
      "sourceFile": "kernel-portal/src/lib/component-docs/origination-flow.ts",
      "portalAnchor": "origination"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [],
    "note": "Offer queue, counter composer, and activity thread conventions for grain origination workflows."
  },
  {
    "id": "pattern.pricing-worksheet",
    "name": "Pricing worksheet",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "pricing-worksheet",
      "sourceFile": "kernel-portal/src/lib/component-docs/pricing-worksheet.ts",
      "portalAnchor": "pricing"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [],
    "note": "Board→basis→cash-bid stack, margin ladder, and bid board. Numbers/margin math are illustrative."
  },
  {
    "id": "pattern.modals",
    "name": "Modals",
    "kind": "pattern",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "modals",
      "sourceFile": "kernel-portal/src/lib/component-docs/modals.ts",
      "portalAnchor": "modals"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [],
    "note": "Size ladder, footer, scrolling, dismissal, and must-choose modal rules."
  },
  {
    "id": "domain.contract-detail",
    "name": "Contract detail",
    "kind": "domain",
    "maturity": "experimental",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "domain",
      "experimental"
    ],
    "capabilities": [
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "portalAnchor": "contract"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "lifecycle-metadata"
    },
    "sourceFiles": [],
    "note": "Domain pattern 1 of 4; kept experimental until contract, settlement, ticket, and invoice pages share one complete domain lineup."
  },
  {
    "id": "domain.settlement-statement",
    "name": "Settlement statement",
    "kind": "domain",
    "maturity": "experimental",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "domain",
      "experimental"
    ],
    "capabilities": [
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "portalAnchor": "settlement"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "lifecycle-metadata"
    },
    "sourceFiles": [],
    "note": "Domain pattern 2 of 4; kept experimental until contract, settlement, ticket, and invoice pages share one complete domain lineup."
  },
  {
    "id": "object.shell",
    "name": "Shell",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "composedWith",
        "target": "object.workspace"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-shell"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026"
  },
  {
    "id": "object.workspace",
    "name": "Workspace",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "composedWith",
        "target": "object.collection"
      },
      {
        "type": "composedWith",
        "target": "object.record"
      },
      {
        "type": "composedWith",
        "target": "object.write"
      },
      {
        "type": "composedWith",
        "target": "object.query"
      },
      {
        "type": "composedWith",
        "target": "object.traversal"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-workspace"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026"
  },
  {
    "id": "object.collection",
    "name": "Collection",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "dependsOn",
        "target": "object.workspace"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-collection"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026 — first Read primitive (many rows of one object)."
  },
  {
    "id": "object.record",
    "name": "Record",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "dependsOn",
        "target": "object.workspace"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-record"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026 — second Read primitive (one row of one object)."
  },
  {
    "id": "object.write",
    "name": "Write",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "dependsOn",
        "target": "object.record"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-write"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026 — write layer (form + in-place postures)."
  },
  {
    "id": "object.query",
    "name": "Query",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "dependsOn",
        "target": "object.collection"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-query"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026 — Aspect: narrows an object row set with predicates; yields a Collection."
  },
  {
    "id": "object.traversal",
    "name": "Traversal",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/definitions",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [
      {
        "type": "dependsOn",
        "target": "object.record"
      }
    ],
    "documentation": {
      "portalAnchor": "obj-traversal"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [
      "packages/definitions/src/composition.ts"
    ],
    "note": "decision 0026 — Aspect: walks declared associations to related object rows."
  },
  {
    "id": "object.designs",
    "name": "Designs",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "kernel-portal",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "portalAnchor": "obj-designs"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [],
    "note": "decision 0026 — auto-derived surface iterating objectRegistry through every primitive preview."
  },
  {
    "id": "object.substrate-demo",
    "name": "Substrate demo",
    "kind": "object",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "kernel-portal",
    "tags": [
      "object",
      "experimental"
    ],
    "capabilities": [
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "portalAnchor": "obj-substrate"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "composition-contract"
    },
    "sourceFiles": [],
    "note": "Decision 0027 — DOM compose vs. canvas boundary. Uses Contract stub rows and mark components (Pin, Plot, ClusterBadge, LegendSwatch)."
  },
  {
    "id": "object.pin",
    "name": "Pin",
    "kind": "object",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "object",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed",
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "slug": "pin",
      "sourceFile": "kernel-portal/src/lib/component-docs/pin.ts",
      "portalAnchor": "mark-pin"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/marks/pin.tsx"
    ],
    "note": "Mark component (decision 0027). Positioned single-record marker; caller owns placement."
  },
  {
    "id": "object.plot",
    "name": "Plot",
    "kind": "object",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "object",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed",
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "slug": "plot",
      "sourceFile": "kernel-portal/src/lib/component-docs/plot.ts",
      "portalAnchor": "mark-plot"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/marks/plot.tsx"
    ],
    "note": "Mark component (decision 0027). Decorative glyph for one datum on a plot or spatial view."
  },
  {
    "id": "object.cluster-badge",
    "name": "ClusterBadge",
    "kind": "object",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "object",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed",
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "slug": "clusterbadge",
      "sourceFile": "kernel-portal/src/lib/component-docs/clusterbadge.ts",
      "portalAnchor": "mark-cluster-badge"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/marks/cluster-badge.tsx"
    ],
    "note": "Mark component (decision 0027). Rolled-up count when marks would overlap."
  },
  {
    "id": "object.legend-swatch",
    "name": "LegendSwatch",
    "kind": "object",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "kernel-portal",
    "tags": [
      "object",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed",
      "composition-contract"
    ],
    "relationships": [],
    "documentation": {
      "slug": "legendswatch",
      "sourceFile": "kernel-portal/src/lib/component-docs/legendswatch.ts",
      "portalAnchor": "mark-legend-swatch"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "packages/ui/src/components/ui/marks/legend-swatch.tsx"
    ],
    "note": "Mark component (decision 0027). Legend row color-key glyph."
  }
] as const satisfies readonly CatalogEntity[]
