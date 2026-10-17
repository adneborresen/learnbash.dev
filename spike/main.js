import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { V86 } from "v86";
import wasmUrl from "v86/build/v86.wasm?url";
import biosUrl from "./assets/seabios.bin?url";
import vgaUrl from "./assets/vgabios.bin?url";
import { AgentClient } from "./agent-client.js";

const SETUP = `rm -f /home/learner/hello.txt`;
const CHECK = `. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/hello.txt
[ -f "$f" ] || fail "There is no file ~/hello.txt yet."
[ "$(cat "$f")" = hi ] || fail "~/hello.txt exists but does not contain exactly: hi"
pass "Nice, ~/hello.txt says hi."`;

const $ = (id) => document.getElementById(id);
const t0 = performance.now();
const timings = [];
const lap = (name) => {
  timings.push(`${name}: ${Math.round(performance.now() - t0)} ms`);
  $("timings").textContent = timings.join("\n");
};
const status = (text, cls = "") => { $("status").textContent = text; $("status").className = cls; };

const term = new Terminal({ fontSize: 15, cursorBlink: true, convertEol: false });
term.open($("term"));
term.resize(Math.max(40, Math.floor($("term").clientWidth / 9.1)), 22);

const vm = new V86({
  wasm_path: wasmUrl,
  bios: { url: biosUrl },
  vga_bios: { url: vgaUrl },
  memory_size: 128 * 1024 * 1024,
  initial_state: { url: "state.bin.zst" },
  uart1: true,
  autostart: true,
  disable_speaker: true,
  disable_keyboard: true,
  disable_mouse: true,
});
const agent = new AgentClient(vm);

// Terminal <-> serial0. Batch output bytes per animation frame for speed.
let pending = [];
vm.add_listener("serial0-output-byte", (b) => {
  if (pending.length === 0) requestAnimationFrame(() => { term.write(new Uint8Array(pending)); pending = []; });
  pending.push(b);
});
term.onData((d) => vm.serial0_send(d));

let pristine = null;

async function startChallenge() {
  if (pristine) await vm.restore_state(pristine);
  await Promise.all([
    agent.send("SETTIME", Math.floor(Date.now() / 1000)),
    agent.send("WINSIZE", term.rows, term.cols),
    agent.send("RUN", SETUP),
  ]);
  term.reset();
  vm.serial0_send("\x0c");
  term.focus();
}

vm.add_listener("emulator-loaded", async () => {
  lap("state downloaded + restored");
  pristine = await vm.save_state();
  lap("pristine copy saved");
  await startChallenge();
  lap("challenge ready");
  status("Ready. Type in the terminal, then press Check.");
  $("check").disabled = $("reset").disabled = false;
});

$("check").onclick = async () => {
  const r = await agent.send("RUN", CHECK);
  status((r.code === 0 ? "✔ " : "✘ ") + r.out, r.code === 0 ? "pass" : "fail");
};
$("reset").onclick = async () => {
  const t = performance.now();
  status("Resetting…");
  await startChallenge();
  status(`Reset done in ${Math.round(performance.now() - t)} ms.`);
};
