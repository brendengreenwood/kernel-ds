import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    composition: "src/composition.ts",
    presets: "src/presets.ts",
  },
  format: ["esm"],
  target: "es2023",
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["zod"],
})
