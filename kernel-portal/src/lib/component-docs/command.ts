import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Command — auto-authored component doc entity; parity-verified against source. */
export const commandDoc: ComponentDoc = parseComponentDoc({
  "id": "command",
  "name": "Command",
  "slug": "command",
  "summary": "Command — component entity.",
  "status": "ready",
  "sourceFiles": [
    "command.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Command where its role in the pattern is clear.",
        "Follow the established component conventions when composing Command."
      ],
      "donts": [
        "Don't repurpose Command for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "command",
        "command-input-wrapper",
        "command-input",
        "command-list",
        "command-empty",
        "command-group",
        "command-separator",
        "command-item",
        "command-shortcut"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Command for its intended component role."
      ],
      "dontUse": [
        "Don't use Command outside its documented purpose."
      ]
    }
  ]
})
