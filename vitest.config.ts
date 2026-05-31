import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    pool: "forks",   // fork-per-file — lower memory than thread pool, keeps mock isolation
    exclude: ["e2e/**", "**/node_modules/**"],
  },
});
