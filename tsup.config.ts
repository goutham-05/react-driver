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
    // driver.js is loaded via dynamic import() — mark it external so the
    // consumer's bundler (Vite/webpack) code-splits it into a separate chunk
    // that's only downloaded when start() is first called.
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
  {
    name: "UMD Build",
    entry: { "react-driver": "src/index.ts" },
    format: ["iife"],
    globalName: "ReactDriver",
    outExtension: () => ({ js: ".umd.js" }),
    dts: false,
    minify: true,
    sourcemap: false,
    external: ["react", "react-dom"],
    esbuildOptions(opts) {
      opts.globalName = "ReactDriver";
    },
  },
]);
