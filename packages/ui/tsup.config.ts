import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    marks: "src/marks.ts",
    icon: "src/icon.ts",
    utils: "src/utils.ts",
  },
  format: ["esm"],
  dts: false,
  clean: true,
  splitting: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
  skipNodeModulesBundle: true,
  tsconfig: "tsconfig.json",
  esbuildOptions(options) {
    options.alias = {
      "@": "../../kernel-portal/src",
    }
  },
})
