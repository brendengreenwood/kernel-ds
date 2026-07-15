# Experimental promotion sweep — 2026-07-15

Promotion bar: accessibility reviewed, original note concern resolved or now stale, mobile audit passes at 390px, and no open decision blocks the row. Routes below were audited with `node kernel-portal/scripts/mobile-audit.mjs` against the Vite preview on port 4173.

| Row | Verdict | Audited route | Reason |
| --- | --- | --- | --- |
| Border beam | Promote to `ready` | `/border-beam` | The effect is opt-in on Button/Input/Card, documented as a third-party MIT visual treatment, and the old static-preview caveat is stale now that the portal is the single DS surface. |
| Commodity tags | Promote to `ready` | `/colors` | Decision 0013 settled the commodity color axis and `CommodityBadge`; the route passes mobile audit. |
| Animated number | Promote to `ready` | `/dashboard` | Decision 0018 settled the reduced-motion behavior; usage is established on dashboard KPIs and settlement net payable. |
| Navigation | Promote to `ready` | `/navigation` | Module switcher, grouped rail, and record-tab conventions are now documented as the app-navigation pattern. |
| Advanced filtering | Promote to `ready` | `/filtering-advanced` | Filter builder, column controls, and date presets are represented by stable exemplars and pass mobile audit. |
| Origination flow | Promote to `ready` | `/origination` | Offer queue, counter composer, and activity thread conventions are stable enough for DS reuse. |
| Pricing worksheet | Promote to `ready` | `/pricing` | The worksheet, margin ladder, and bid board layout are stable; numeric values remain illustrative content, not API shape. |
| Modals | Promote to `ready` | `/modals` | Size ladder, footer, scrolling, dismissal, and must-choose rules are documented by the modal-pattern route. |
| Contract detail | Keep `experimental` | `/contract` | Domain pattern 1 of 4: it should stay marked until contract, settlement, ticket, and invoice pages share one complete domain lineup. |
| Settlement statement | Keep `experimental` | `/settlement` | Domain pattern 2 of 4: it should stay marked until the same four-page domain lineup is complete. |

## Mobile audit evidence

```text
=== http://localhost:4173/border-beam ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/colors ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/dashboard ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/navigation ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/filtering-advanced ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/origination ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/pricing ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/modals ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/contract ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0

=== http://localhost:4173/settlement ===
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0
```
