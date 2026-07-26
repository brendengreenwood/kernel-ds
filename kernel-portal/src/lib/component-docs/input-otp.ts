import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Input OTP — component doc entity; parity-verified against source. */
export const inputOtpDoc: ComponentDoc = parseComponentDoc({
  id: "input-otp",
  name: "Input OTP",
  slug: "input-otp",
  summary:
    "A segmented field for entering a short, fixed-length code — a one-time passcode, a 2FA token, a verification PIN. Each character gets its own slot, so the user can see progress and the input can auto-advance and accept a pasted code cleanly.",
  status: "ready",
  sourceFiles: ["input-otp.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use it only for short codes of a known length; set the slot count to match exactly (usually 4–6).",
        "Auto-advance on entry and accept a full pasted code across the slots — users copy these from email or an authenticator.",
        "Use a `SeparatorSlot` to group longer codes (e.g. `123-456`) and set the right `inputMode`/`autocomplete` so mobile keyboards and one-time-code autofill work.",
      ],
      donts: [
        "Don't use segmented slots for free-form or variable-length input — that's a plain Input.",
        "Don't block paste or force one keystroke per box; that turns a five-second task into a chore.",
        "Don't leave failure silent — on a wrong code, clear the slots and surface a clear retry message.",
      ],
    },
    { kind: "anatomy", slots: ["input-otp", "input-otp-group", "input-otp-slot", "input-otp-separator"] },
    {
      kind: "useCases",
      use: [
        "Entering an emailed or SMS one-time passcode during sign-in.",
        "A 2FA / authenticator token step.",
        "A short verification PIN confirming a sensitive action.",
      ],
      dontUse: [
        "Free-form text or variable-length values — use an Input.",
        "A long secret or password — use a password Input.",
      ],
    },
  ],
})
