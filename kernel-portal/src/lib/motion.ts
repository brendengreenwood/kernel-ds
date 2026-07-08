/**
 * Shared motion config for `@formkit/auto-animate` (decision 0018).
 *
 * Timing rides the motion tokens — 200ms (`--duration-base`) on the
 * `--ease-out` curve — so list/reorder animation feels like the rest of the
 * system. auto-animate respects `prefers-reduced-motion` by default, so the
 * decision-0018 reduced-motion guard applies for free.
 */
export const autoAnimateConfig = {
  duration: 200,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const
