import { copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const src  = resolve(__dirname, "../node_modules/driver.js/dist/driver.css");
const dest = resolve(__dirname, "../dist/driver.css");

copyFileSync(src, dest);
console.log("Copied driver.js/dist/driver.css → dist/driver.css");
