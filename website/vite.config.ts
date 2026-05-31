import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const rootPkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
) as { version: string };

export default defineConfig({
  plugins: [react()],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(rootPkg.version),
  },
  resolve: {
    alias: {
      "@oqlet/react-driver/driver.css": path.resolve(__dirname, "../node_modules/driver.js/dist/driver.css"),
      "@oqlet/react-driver": path.resolve(__dirname, "../src"),
    },
  },
});
