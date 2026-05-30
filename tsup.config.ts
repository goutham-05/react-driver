import { defineConfig } from "tsup";

export default defineConfig([
  {
    name: "ESM Build",
    entry: ["src/index.ts"],
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom", "driver.js"],
  },
  {
    name: "CJS Build",
    entry: ["src/index.ts"],
    format: ["cjs"],
    outExtension: () => ({ js: ".js" }),
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom", "driver.js"],
  },
]);
