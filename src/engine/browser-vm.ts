// Creates a VmSession in the browser. Import this module dynamically
// (`await import(...)`) so v86 is only downloaded on pages that need it.
import { V86 } from "v86";
import wasmUrl from "v86/build/v86.wasm?url";
import biosUrl from "../../image/bios/seabios.bin?url";
import vgaBiosUrl from "../../image/bios/vgabios.bin?url";
import { VmSession, type V86Like } from "./vm-session.ts";

/** public/vm/vm.json, written by scripts/stage-vm-assets.ts. */
export interface VmAssets {
  state: string;
  stateSize: number;
  stateRawSize: number;
  memoryMB: number;
}

export interface LoadOptions {
  /** URL of the folder holding vm.json and the snapshot. */
  base?: string;
  onProgress?: (loadedBytes: number, totalBytes: number) => void;
}

async function fetchWithProgress(url: string, total: number, onProgress?: LoadOptions["onProgress"]) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`could not download ${url} (HTTP ${res.status})`);
  const out = new Uint8Array(total);
  const reader = res.body.getReader();
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (loaded + value.length > total) throw new Error(`${url} is larger than expected`);
    out.set(value, loaded);
    loaded += value.length;
    onProgress?.(loaded, total);
  }
  if (loaded !== total) throw new Error(`${url}: got ${loaded} of ${total} bytes`);
  return out;
}

export async function loadBrowserSession(options: LoadOptions = {}): Promise<VmSession> {
  const base = new URL(options.base ?? `${import.meta.env.BASE_URL}vm/`, location.href);
  const assetsRes = await fetch(new URL("vm.json", base), { cache: "no-cache" });
  if (!assetsRes.ok) throw new Error(`could not load vm.json (HTTP ${assetsRes.status})`);
  const assets: VmAssets = await assetsRes.json();

  const zst = await fetchWithProgress(new URL(assets.state, base).href, assets.stateSize, options.onProgress);

  const vm = new V86({
    wasm_path: wasmUrl,
    bios: { url: biosUrl },
    vga_bios: { url: vgaBiosUrl },
    memory_size: assets.memoryMB * 1024 * 1024,
    uart1: true,
    autostart: false, // started after the snapshot is restored
    disable_speaker: true,
    disable_keyboard: true,
    disable_mouse: true,
  }) as unknown as V86Like & { add_listener(e: "emulator-ready", f: () => void): void };
  await new Promise<void>((resolve) => vm.add_listener("emulator-ready", () => resolve()));
  return new VmSession(vm, { zst, rawSize: assets.stateRawSize });
}
