import { z } from "zod";

/**
 * Prototype manifest contract, version 1.
 * Documented in kernel-studio-server/PROTOTYPE-CONTRACT.md.
 */

const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,80}$/, "ids are lowercase kebab-case");

const screenSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  file: z
    .string()
    .regex(/^screens\/[A-Za-z0-9._-]+\.jsx$/, "screen files live under screens/ and end in .jsx"),
  description: z.string().optional(),
});

const edgeSchema = z.object({
  from: idSchema,
  to: idSchema,
  label: z.string().optional(),
});

const directionSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1),
    note: z.string().optional(),
    screens: z.array(screenSchema).min(1),
    edges: z.array(edgeSchema),
  })
  .superRefine((direction, ctx) => {
    const screenIds = new Set(direction.screens.map((screen) => screen.id));
    if (screenIds.size !== direction.screens.length) {
      ctx.addIssue({ code: "custom", message: "duplicate screen ids", path: ["screens"] });
    }
    direction.edges.forEach((edge, index) => {
      if (!screenIds.has(edge.from)) {
        ctx.addIssue({
          code: "custom",
          message: `edge.from "${edge.from}" does not match any screen id`,
          path: ["edges", index, "from"],
        });
      }
      if (!screenIds.has(edge.to)) {
        ctx.addIssue({
          code: "custom",
          message: `edge.to "${edge.to}" does not match any screen id`,
          path: ["edges", index, "to"],
        });
      }
    });
  });

export const manifestSchema = z
  .object({
    version: z.literal(1),
    id: idSchema,
    title: z.string().min(1),
    prompt: z.string(),
    createdAt: z.iso.datetime({ offset: true, local: true }),
    directions: z.array(directionSchema).min(1),
  })
  .superRefine((manifest, ctx) => {
    const directionIds = new Set(manifest.directions.map((direction) => direction.id));
    if (directionIds.size !== manifest.directions.length) {
      ctx.addIssue({ code: "custom", message: "duplicate direction ids", path: ["directions"] });
    }
  });

export type PrototypeManifest = z.infer<typeof manifestSchema>;
export type PrototypeDirection = PrototypeManifest["directions"][number];
export type PrototypeScreen = PrototypeDirection["screens"][number];
export type PrototypeEdge = PrototypeDirection["edges"][number];
