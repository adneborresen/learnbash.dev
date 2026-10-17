// Cold-boots the image once, waits for the guest agent and the learner's
// prompt, then saves a zstd-compressed VM snapshot plus a manifest that
// records exactly what the snapshot was built from.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { bootFromImage, IMAGE_DIR, ROOT, STATE_FILE, VM_CONFIG } from "./lib/node-vm.ts";

// Cloudflare Pages rejects files over 25 MiB; keep a safety margin.
const MAX_STATE_BYTES = 20 * 1024 * 1024;

const sha256 = (file: string) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const t0 = Date.now();
const node = bootFromImage();
await node.agent.waitReady();
await node.terminal.waitFor("$ ", 60000);
const bootMs = Date.now() - t0;
const ping = await node.agent.send("PING");
if (ping.out !== "pong") throw new Error(`agent PING returned ${JSON.stringify(ping)}`);

const raw = new Uint8Array(await node.vm.save_state());
await node.destroy();
const zst = zlib.zstdCompressSync(raw, {
  params: { [zlib.constants.ZSTD_c_compressionLevel]: 19 },
});
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
fs.writeFileSync(STATE_FILE, zst);

const v86Version = JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules/v86/package.json"), "utf8")).version;
const manifest = {
  builtAt: new Date().toISOString(),
  v86: v86Version,
  alpine: fs.readFileSync(path.join(IMAGE_DIR, "alpine-release"), "utf8").trim(),
  vmConfig: VM_CONFIG,
  bootMs,
  sizes: { stateRaw: raw.length, stateZst: zst.length },
  sha256: {
    "state.bin.zst": sha256(STATE_FILE),
    vmlinuz: sha256(path.join(IMAGE_DIR, "vmlinuz")),
    "initrd.gz": sha256(path.join(IMAGE_DIR, "initrd.gz")),
    "packages.txt": sha256(path.join(IMAGE_DIR, "packages.txt")),
    "seabios.bin": sha256(path.join(ROOT, "image/bios/seabios.bin")),
    "vgabios.bin": sha256(path.join(ROOT, "image/bios/vgabios.bin")),
  },
};
fs.writeFileSync(path.join(path.dirname(STATE_FILE), "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`boot ${bootMs} ms, snapshot ${(raw.length / 1e6).toFixed(1)} MB raw, ${(zst.length / 1e6).toFixed(2)} MB zstd`);
if (zst.length > MAX_STATE_BYTES) {
  console.error(`snapshot is larger than the ${MAX_STATE_BYTES / 1024 / 1024} MiB budget`);
  process.exit(1);
}
process.exit(0);
