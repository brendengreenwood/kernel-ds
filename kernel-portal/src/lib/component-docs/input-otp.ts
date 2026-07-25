import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Input OTP — auto-authored component doc entity; parity-verified against source. */
export const inputOtpDoc: ComponentDoc = parseComponentDoc({
  "id": "input-otp",
  "name": "Input OTP",
  "slug": "input-otp",
  "summary": "Input OTP — component entity.",
  "status": "ready",
  "sourceFiles": [
    "input-otp.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Input OTP where its role in the pattern is clear.",
        "Follow the established component conventions when composing Input OTP."
      ],
      "donts": [
        "Don't repurpose Input OTP for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "input-otp",
        "input-otp-group",
        "input-otp-slot",
        "input-otp-separator"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Input OTP for its intended component role."
      ],
      "dontUse": [
        "Don't use Input OTP outside its documented purpose."
      ]
    }
  ]
})
