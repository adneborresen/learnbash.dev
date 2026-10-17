// Restores the snapshot and runs one challenge: correct and wrong answers.
import fs from "node:fs";
import zlib from "node:zlib";
import { createVm } from "./vm-node.mjs";

const CTRL_L = String.fromCharCode(12); // clear screen + redraw the prompt

const SETUP = `rm -f /home/learner/hello.txt`;
const CHECK = `. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/hello.txt
[ -f "$f" ] || fail "There is no file ~/hello.txt yet."
[ "$(cat "$f")" = hi ] || fail "~/hello.txt exists but does not contain exactly: hi"
pass "Nice, ~/hello.txt says hi."`;

const state = zlib.zstdDecompressSync(fs.readFileSync("build/state/state.bin.zst"));

async function attempt(commands) {
  const t0 = Date.now();
  const { vm, terminal, agent } = createVm({ boot: false });
  await new Promise((r) => vm.add_listener("emulator-ready", r));
  await vm.restore_state(state.buffer.slice(state.byteOffset, state.byteOffset + state.byteLength));
  const tRestored = Date.now();
  await agent.send("SETTIME", Math.floor(Date.now() / 1000));
  const setup = await agent.send("RUN", SETUP);
  if (setup.code !== 0) throw new Error("setup failed: " + setup.out);
  vm.serial0_send(CTRL_L);
  await terminal.waitFor("$ ", 20000);
  const tShell = Date.now();
  for (const c of commands) {
    vm.serial0_send(c + "\n");
    vm.serial0_send("echo __DONE__\n");
    await terminal.waitFor("__DONE__\r\n");
  }
  const res = await agent.send("RUN", CHECK);
  vm.destroy();
  return { ...res, restoreMs: tRestored - t0, readyMs: tShell - t0 };
}

const good = await attempt(["echo hi > ~/hello.txt"]);
const bad = await attempt(["echo hello > ~/hello.txt"]);
const none = await attempt([]);
console.log({ good, bad, none });
const ok = good.code === 0 && bad.code !== 0 && none.code !== 0;
console.log(ok ? "SPIKE CHECK: PASS" : "SPIKE CHECK: FAIL");
process.exit(ok ? 0 : 1);
