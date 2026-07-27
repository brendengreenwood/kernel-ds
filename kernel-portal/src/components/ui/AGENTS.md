shadcn-derived primitives + local customizations. These are the building blocks; portal pages compose them

Icons: import glyphs ONLY from ./icon (the MDI shim — lucide-named components backed by @mdi/js paths). Never import from lucide-react. A new glyph = add one `lucide name → mdi* export` line to icon.tsx (prefer the *Outline variant). When a shadcn CLI component lands with lucide-react imports, redirect them to the shim
Control heights come from --control-h-sm/-h/-h-lg tokens (32/38/44px) — buttons, inputs, select triggers reference them; never hardcode a height
Motion is token-driven — animate with duration-[var(--duration-base)] ease-[var(--ease-out)], never ad-hoc ms/curves. The prefers-reduced-motion guard in index.css covers new motion for free
cva variants are the source the parity gate reads — documented variant keys in the doc entity must match cva({ variants }) keys. data-slot="..." literals are the anatomy source of truth
Base UI (@base-ui/react) backs several primitives; subcomponent names differ from Radix (e.g. Tabs ships TabsList/TabsTrigger/TabsContent) — the ds-bundle export map is the authority on what a screen may destructure

marks/ — decorative/animated marks (pin, animated-number, border-beam, etc.) with their own __check__.mjs: node src/components/ui/marks/__check__.mjs

After changing a primitive's variants or slots, re-run the parity gate: node scripts/check-component-docs.mjs
