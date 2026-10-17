// Spike helper: run the learnbash VM headlessly in Node with v86.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { V86 } from "v86";
import { AgentClient } from "./agent-client.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const img = (p) => ({ buffer: fs.readFileSync(p).buffer });

export const MEMORY_MB = Number(process.env.MEMORY_MB ?? 128);

export function createVm({ boot = true } = {}) {
  const opts = {
    wasm_path: path.join(root, "node_modules/v86/build/v86.wasm"),
    bios: img(path.join(here, "assets/seabios.bin")),
    vga_bios: img(path.join(here, "assets/vgabios.bin")),
    memory_size: MEMORY_MB * 1024 * 1024,
    uart1: true,
    autostart: true,
    disable_speaker: true,
    disable_keyboard: true,
    disable_mouse: true,
  };
  if (boot) {
    opts.bzimage = img(path.join(root, "build/image/vmlinuz"));
    opts.initrd = img(path.join(root, "build/image/initrd.gz"));
    opts.cmdline = "console=ttyS0 quiet tsc=reliable mitigations=off random.trust_cpu=on init_on_free=1";
  }
  const vm = new V86(opts);
  return { vm, terminal: new SerialText(vm, 0), agent: new AgentClient(vm) };
}

// Collects everything written to a serial port (the learner's terminal).
export class SerialText {
  constructor(vm, port) {
    this.text = "";
    this.waiters = [];
    vm.add_listener(`serial${port}-output-byte`, (b) => {
      this.text += String.fromCharCode(b);
      for (const w of [...this.waiters]) w();
    });
  }
  waitFor(needle, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const start = this.text.length;
      const check = () => {
        if (this.text.indexOf(needle, start) !== -1) {
          this.waiters = this.waiters.filter((w) => w !== check);
          clearTimeout(t);
          resolve();
        }
      };
      const t = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w !== check);
        reject(new Error(`timeout waiting for ${JSON.stringify(needle)}; tail: ${JSON.stringify(this.text.slice(-300))}`));
      }, timeoutMs);
      this.waiters.push(check);
    });
  }
}
