import { defineConfig } from "tsup";

export default defineConfig([
  {
    name: "ESM Build",
    entry: ["src/index.ts", "src/testing.ts"],
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
  },
  {
    name: "CJS Build",
    entry: ["src/index.ts", "src/testing.ts"],
    format: ["cjs"],
    outExtension: () => ({ js: ".js" }),
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom"],
  },
]);
