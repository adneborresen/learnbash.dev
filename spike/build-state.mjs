// Boots the image, waits for the guest agent, saves a compressed snapshot.
import fs from "node:fs";
import zlib from "node:zlib";
import { createVm, MEMORY_MB } from "./vm-node.mjs";

const t0 = Date.now();
const { vm, terminal, agent } = createVm();
await agent.waitReady();
const tReady = Date.now();
await terminal.waitFor("$ ", 60000);
const tPrompt = Date.now();
const pong = await agent.send("PING");
const state = new Uint8Array(await vm.save_state());
const zst = zlib.zstdCompressSync(state, { params: { [zlib.constants.ZSTD_c_compressionLevel]: 19 } });
fs.mkdirSync("build/state", { recursive: true });
fs.writeFileSync("build/state/state.bin.zst", zst);
vm.destroy();
console.log(JSON.stringify({
  memoryMB: MEMORY_MB,
  bootToAgentMs: tReady - t0,
  bootToPromptMs: tPrompt - t0,
  ping: pong.out,
  stateMB: +(state.length / 1e6).toFixed(1),
  stateZstMB: +(zst.length / 1e6).toFixed(2),
}, null, 2));
process.exit(0);
