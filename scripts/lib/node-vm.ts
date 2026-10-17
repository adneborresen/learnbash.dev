// Runs the learnbash VM headlessly in Node (build scripts and tests).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { V86 } from "v86";
import { AgentClient } from "../../src/engine/agent-client.ts";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const IMAGE_DIR = path.join(ROOT, "build/image");
export const STATE_FILE = path.join(ROOT, "build/state/state.bin.zst");
export const VM_CONFIG: { memoryMB: number; cmdline: string } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "image/vm-config.json"), "utf8"),
);

const CTRL_L = String.fromCharCode(12);

function image(file: string): { buffer: ArrayBuffer } {
  const b = fs.readFileSync(file);
  return { buffer: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
}

/** Collects text written to a serial port and lets callers wait for output. */
export class SerialText {
  text = "";
  private waiters: Array<() => void> = [];

  constructor(vm: V86, port: number) {
    vm.add_listener(`serial${port}-output-byte` as "serial0-output-byte", (b: number) => {
      this.text += String.fromCharCode(b);
      for (const w of [...this.waiters]) w();
    });
  }

  /** Waits until `needle` appears in output produced after this call. */
  waitFor(needle: string | RegExp, timeoutMs = 30000): Promise<string> {
    const start = this.text.length;
    return new Promise((resolve, reject) => {
      const check = () => {
        const tail = this.text.slice(start);
        const hit = typeof needle === "string" ? tail.includes(needle) : needle.test(tail);
        if (!hit) return;
        done();
        resolve(tail);
      };
      const done = () => {
        clearTimeout(timer);
        this.waiters = this.waiters.filter((w) => w !== check);
      };
      const timer = setTimeout(() => {
        done();
        reject(new Error(`timed out waiting for ${needle}; last output: ${JSON.stringify(this.text.slice(-300))}`));
      }, timeoutMs);
      this.waiters.push(check);
    });
  }
}

export interface NodeVm {
  vm: V86;
  terminal: SerialText;
  agent: AgentClient;
  destroy(): Promise<void>;
}

function create(extra: Record<string, unknown>): NodeVm {
  const vm = new V86({
    wasm_path: path.join(ROOT, "node_modules/v86/build/v86.wasm"),
    bios: image(path.join(ROOT, "image/bios/seabios.bin")),
    vga_bios: image(path.join(ROOT, "image/bios/vgabios.bin")),
    memory_size: VM_CONFIG.memoryMB * 1024 * 1024,
    uart1: true,
    autostart: true,
    disable_speaker: true,
    disable_keyboard: true,
    disable_mouse: true,
    ...extra,
  });
  return {
    vm,
    terminal: new SerialText(vm, 0),
    agent: new AgentClient(vm),
    destroy: () => vm.destroy(),
  };
}

/** Cold-boots the kernel + initramfs (only used to create the snapshot). */
export function bootFromImage(): NodeVm {
  return create({
    bzimage: image(path.join(IMAGE_DIR, "vmlinuz")),
    initrd: image(path.join(IMAGE_DIR, "initrd.gz")),
    cmdline: VM_CONFIG.cmdline,
  });
}

let cachedState: ArrayBuffer | undefined;
function loadState(): ArrayBuffer {
  if (!cachedState) {
    const raw = zlib.zstdDecompressSync(fs.readFileSync(STATE_FILE));
    cachedState = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  }
  return cachedState;
}

/**
 * Starts a VM from the saved snapshot, like the website does: restore, set the
 * clock, then redraw the learner's prompt. Returns once the prompt is visible.
 */
export async function startFromSnapshot(): Promise<NodeVm> {
  const node = create({});
  await new Promise<void>((resolve) => node.vm.add_listener("emulator-ready", () => resolve()));
  await node.vm.restore_state(loadState());
  await node.agent.send("SETTIME", Math.floor(Date.now() / 1000));
  const prompt = node.terminal.waitFor("$ ", 20000);
  node.vm.serial0_send(CTRL_L);
  await prompt;
  return node;
}

let sentinel = 0;
/**
 * Types a command line into the learner's shell, waits until it has finished
 * and returns what the terminal printed plus the command's exit code.
 * (A command that reads from the keyboard would swallow the marker line.)
 */
export async function typeCommand(
  node: NodeVm,
  line: string,
  timeoutMs = 30000,
): Promise<{ output: string; exitCode: number }> {
  const id = ++sentinel;
  // The marker is assembled at runtime, so the echoed command line itself
  // never matches the pattern we wait for.
  const pattern = new RegExp("__LB_DONE_" + id + "__:(\\d+)\\r\\n");
  const done = node.terminal.waitFor(pattern, timeoutMs);
  node.vm.serial0_send(line + "\n");
  node.vm.serial0_send(
    "__lb_rc=$?; __lb_m=__LB_DONE_" + id + '; echo "${__lb_m}__:${__lb_rc}"\n',
  );
  const output = await done;
  return { output, exitCode: Number(pattern.exec(output)![1]) };
}
