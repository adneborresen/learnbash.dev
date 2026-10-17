// Copies the built snapshot into public/vm/ under a content-hashed name (so it
// can be cached forever) and writes vm.json, which the website reads first.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, STATE_FILE } from "./lib/node-vm.ts";

const outDir = path.join(ROOT, "public/vm");
const manifest = JSON.parse(fs.readFileSync(path.join(path.dirname(STATE_FILE), "manifest.json"), "utf8"));
const zst = fs.readFileSync(STATE_FILE);
const hash = crypto.createHash("sha256").update(zst).digest("hex").slice(0, 12);
const name = `state.${hash}.bin.zst`;

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(STATE_FILE, path.join(outDir, name));
const assets = {
  state: name,
  stateSize: zst.length,
  stateRawSize: manifest.sizes.stateRaw,
  memoryMB: manifest.vmConfig.memoryMB,
};
fs.writeFileSync(path.join(outDir, "vm.json"), JSON.stringify(assets, null, 2) + "\n");
console.log(`staged public/vm/${name} (${(zst.length / 1e6).toFixed(2)} MB)`);
