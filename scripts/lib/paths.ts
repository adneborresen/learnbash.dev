import path from "node:path";
import { fileURLToPath } from "node:url";

/** The repository root. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
