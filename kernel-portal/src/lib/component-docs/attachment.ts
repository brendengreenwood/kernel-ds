import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Attachment — component doc entity; parity-verified against source. */
export const attachmentDoc: ComponentDoc = parseComponentDoc({
  id: "attachment",
  name: "Attachment",
  slug: "attachment",
  summary:
    "A file riding along with a message — contract PDF, bill of lading, inspection photo. Attachment carries the upload lifecycle in one prop: idle draws a dashed drop target, uploading and processing shimmer the title, error turns the border and text destructive, done settles. Group them horizontally when a turn carries several.",
  status: "ready",
  sourceFiles: ["attachment.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Drive the whole tile from state rather than hand-styling each phase — the dashed border, the shimmer, and the destructive treatment all key off it.",
        "Use orientation=\"vertical\" for image thumbnails and horizontal for documents; the vertical form moves the actions to a floating overlay so the preview stays uncropped.",
        "Put the file name in AttachmentTitle and the size or type in AttachmentDescription. Both truncate, so a long name won't blow out the row.",
        "Wrap the tile in AttachmentTrigger when opening the file is the primary action, and keep AttachmentAction for the secondary controls — remove, retry, download.",
        "Set variant=\"image\" on AttachmentMedia when you're rendering a real thumbnail; it handles the object-fit and the dimming while the upload is still in flight.",
      ],
      donts: [
        "Don't leave state at its default while an upload is running — a finished-looking tile for an in-flight file is a lie.",
        "Don't nest a button inside AttachmentTrigger. The trigger already covers the tile; a nested control can't be reached.",
        "Don't put more than two actions in AttachmentActions. Past that, the tile stops being a chip and needs a row in a table.",
        "Don't use xs with a description — there isn't room, and the text will truncate to nothing.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard tile — a document with a name and a size line." },
            { key: "sm", description: "Denser tile for a turn that carries several files." },
            { key: "xs", description: "Chip-sized. Name only, no description." },
          ],
        },
        {
          axis: "orientation",
          defaultKey: "horizontal",
          keys: [
            { key: "horizontal", description: "Media on the leading edge, text beside it. The document layout." },
            { key: "vertical", description: "Media on top with the actions floating over it. The thumbnail layout." },
          ],
        },
        {
          axis: "variant",
          defaultKey: "icon",
          keys: [
            { key: "icon", description: "The media slot holds a file-type glyph on a muted square." },
            { key: "image", description: "The media slot holds a real thumbnail — cover-fit, dimmed until the upload finishes." },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "attachment-group",
        "attachment",
        "attachment-media",
        "attachment-content",
        "attachment-title",
        "attachment-description",
        "attachment-actions",
        "attachment-action",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "state",
          type: '"idle" | "uploading" | "processing" | "error" | "done"',
          default: '"done"',
          description: "The lifecycle phase. Drives the border, the shimmer on the title, and the destructive treatment on error.",
        },
        {
          name: "size",
          type: '"default" | "sm" | "xs"',
          default: '"default"',
          description: "Tile density. xs drops the description line.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Document layout versus thumbnail layout. Vertical floats the actions over the media.",
        },
        {
          name: "variant",
          type: '"icon" | "image"',
          default: '"icon"',
          description: "On AttachmentMedia — whether the media slot holds a glyph or a real image.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description: "On AttachmentTrigger — swap the covering element, e.g. an anchor that opens the file.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the slot you set it on.",
        },
      ],
    },
    {
      kind: "states",
      items: [
        { name: "Idle", description: "Nothing uploaded yet. The border goes dashed, marking the tile as a drop target." },
        { name: "Uploading", description: "Bytes in flight. The title shimmers; pair it with a Spinner in the media slot." },
        { name: "Processing", description: "Uploaded but not yet usable — parsing, virus scan, OCR. Same shimmer, different cause." },
        { name: "Error", description: "The upload or the processing failed. Border and description turn destructive; put the reason in the description." },
        { name: "Done", description: "The file is attached and openable. The default." },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Files an operator attaches to a message — contracts, manifests, inspection photos.",
        "Documents the agent produced and handed back, listed under its reply.",
        "A drop target in a composer, sitting in the idle state until a file lands.",
      ],
      dontUse: [
        "A document library or any list that needs sorting and filtering — use Table.",
        "A single downloadable link in prose — use a plain anchor.",
        "An image gallery where the picture is the content — use Carousel or an aspect-ratio grid.",
      ],
    },
  ],
})
