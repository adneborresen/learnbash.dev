// Developer playground for the engine (not part of the public site).
import { TerminalView } from "../engine/terminal-view.ts";

const SETUP = "rm -f /home/learner/hello.txt";
const CHECK = `. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/hello.txt
[ -f "$f" ] || fail "There is no file ~/hello.txt yet."
[ "$(cat "$f")" = hi ] || fail "~/hello.txt exists but does not contain exactly: hi"
pass "Nice, ~/hello.txt says hi."`;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const t0 = performance.now();
const log: string[] = [];
const lap = (what: string) => {
  log.push(`${what}: ${Math.round(performance.now() - t0)} ms`);
  $("timings").textContent = log.join("\n");
};
const status = (text: string, cls = "") => {
  $("status").textContent = text;
  $("status").className = cls;
};

const view = new TerminalView($("term"));
view.renderKeyBar($("keys"));

const { loadBrowserSession } = await import("../engine/browser-vm.ts");
lap("engine code loaded");
const progress = $<HTMLProgressElement>("progress");
const session = await loadBrowserSession({
  onProgress: (loaded, total) => (progress.value = loaded / total),
});
progress.hidden = true;
lap("snapshot downloaded, emulator ready");
view.attach(session);
(window as unknown as { lbSession: unknown }).lbSession = session; // for debugging in the console

const start = async () => {
  await session.start({ setup: SETUP, rows: view.rows, cols: view.cols });
  const t = session.lastStartTimings!;
  lap(`  start phases: decompress ${t.decompressMs} ms, restore ${t.restoreMs} ms, setup ${t.setupMs} ms`);
  view.focus();
};
await start();
lap("challenge ready");
// A quick benchmark of guest agent round trips (useful when comparing devices).
const pings: number[] = [];
for (let i = 0; i < 5; i++) {
  const a = performance.now();
  await session.agent.send("PING");
  pings.push(Math.round(performance.now() - a));
}
lap(`  agent PING round trips: ${pings.join(" / ")} ms`);
status("Ready. Type in the terminal, then press Check.");
$<HTMLButtonElement>("check").disabled = false;
$<HTMLButtonElement>("reset").disabled = false;

$("check").addEventListener("click", async () => {
  const r = await session.check(CHECK);
  status((r.passed ? "✔ " : "✘ ") + r.message, r.passed ? "pass" : "fail");
  view.focus();
});
$("reset").addEventListener("click", async () => {
  const t = performance.now();
  status("Resetting…");
  await start();
  status(`Reset done in ${Math.round(performance.now() - t)} ms.`);
});
