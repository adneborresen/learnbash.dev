// Runs the learnbash VM headlessly in Node (build scripts and tests).
import fs from "node:fs";
import path from "node:path";
import { V86 } from "v86";
import { AgentClient } from "../../src/engine/agent-client.ts";
import { VmSession, type StartOptions, type V86Like } from "../../src/engine/vm-session.ts";
import { ROOT } from "./paths.ts";

export { ROOT };
export const IMAGE_DIR = path.join(ROOT, "build/image");
export const STATE_DIR = path.join(ROOT, "build/state");
export const STATE_FILE = path.join(STATE_DIR, "state.bin.zst");
export const VM_CONFIG: { memoryMB: number; cmdline: string } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "image/vm-config.json"), "utf8"),
);

function image(file: string): { buffer: ArrayBuffer } {
  const b = fs.readFileSync(file);
  return { buffer: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
}

/** Collects text written to the terminal and lets callers wait for output. */
export class SerialText {
  text = "";
  private waiters: Array<() => void> = [];

  constructor(subscribe: (listener: (byte: number) => void) => void) {
    subscribe((b) => {
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

function createV86(extra: Record<string, unknown>): V86 {
  return new V86({
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
}

/** Cold-boots the kernel + initramfs (only used to create the snapshot). */
export function bootFromImage() {
  const vm = createV86({
    bzimage: image(path.join(IMAGE_DIR, "vmlinuz")),
    initrd: image(path.join(IMAGE_DIR, "initrd.gz")),
    cmdline: VM_CONFIG.cmdline,
  });
  return {
    vm,
    terminal: new SerialText((l) => vm.add_listener("serial0-output-byte", l)),
    agent: new AgentClient(vm),
    destroy: () => vm.destroy(),
  };
}

export interface NodeSession {
  session: VmSession;
  terminal: SerialText;
  destroy(): Promise<void>;
}

/** Creates a VM session from the saved snapshot, exactly like the website. */
export async function createSession(): Promise<NodeSession> {
  const manifest = JSON.parse(fs.readFileSync(path.join(STATE_DIR, "manifest.json"), "utf8"));
  const vm = createV86({});
  await new Promise<void>((resolve) => vm.add_listener("emulator-ready", () => resolve()));
  const session = new VmSession(vm as unknown as V86Like, {
    zst: new Uint8Array(fs.readFileSync(STATE_FILE)),
    rawSize: manifest.sizes.stateRaw,
  });
  const terminal = new SerialText((l) => session.onOutput(l));
  return { session, terminal, destroy: () => session.destroy() };
}

/** (Re)starts a challenge and waits until the learner's prompt is visible. */
export async function startChallenge(node: NodeSession, options: StartOptions = {}): Promise<void> {
  const prompt = node.terminal.waitFor("$ ", 20000);
  await node.session.start(options);
  await prompt;
}

/** createSession() + startChallenge(). */
export async function startSession(options: StartOptions = {}): Promise<NodeSession> {
  const node = await createSession();
  await startChallenge(node, options);
  return node;
}

/** Removes terminal control sequences (colours, cursor movement, titles). */
export function stripAnsi(text: string): string {
  return text
    .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, "")
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "")
    .replace(/\x1b[()][0-9A-Za-z]/g, "");
}

let sentinel = 0;
/**
 * Types a command line into the learner's shell, waits until it has finished
 * and returns what the terminal printed (without colour codes) plus the
 * command's exit code.
 * (A command that reads from the keyboard would swallow the marker line.)
 */
export async function typeCommand(
  node: NodeSession,
  line: string,
  timeoutMs = 30000,
): Promise<{ output: string; exitCode: number }> {
  const id = ++sentinel;
  // The marker is assembled at runtime, so the echoed command line itself
  // never matches the pattern we wait for.
  const pattern = new RegExp("__LB_DONE_" + id + "__:(\\d+)\\r\\n");
  const done = node.terminal.waitFor(pattern, timeoutMs);
  node.session.sendInput(line + "\n");
  node.session.sendInput(
    "__lb_rc=$?; __lb_m=__LB_DONE_" + id + '; echo "${__lb_m}__:${__lb_rc}"\n',
  );
  const output = stripAnsi(await done);
  return { output, exitCode: Number(pattern.exec(output)![1]) };
}
