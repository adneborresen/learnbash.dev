// Engine tests: VmSession start/check/reset/resize against the real snapshot.
import fs from "node:fs";
import zlib from "node:zlib";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { SetupError } from "../src/engine/vm-session.ts";
import {
  createSession,
  startChallenge,
  STATE_FILE,
  typeCommand,
  type NodeSession,
} from "../scripts/lib/node-vm.ts";

let node: NodeSession;
beforeAll(async () => {
  node = await createSession();
});
afterAll(async () => {
  await node?.destroy();
});

const sh = (line: string) => typeCommand(node, line);

const HELLO_CHECK = `. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/hello.txt
[ -f "$f" ] || fail "There is no file ~/hello.txt yet."
[ "$(cat "$f")" = hi ] || fail "~/hello.txt exists but does not contain exactly: hi"
pass "Nice, ~/hello.txt says hi."`;

describe("VmSession", () => {
  test("v86's built-in zstd decompressor restores the exact snapshot bytes", () => {
    // VmSession relies on this undocumented v86 helper; this test catches a
    // v86 upgrade that removes or changes it.
    const zst = fs.readFileSync(STATE_FILE);
    const expected = zlib.zstdDecompressSync(zst);
    const vm = (node.session as unknown as { vm: { zstd_decompress(n: number, s: Uint8Array): ArrayBuffer } }).vm;
    const actual = new Uint8Array(vm.zstd_decompress(expected.length, new Uint8Array(zst)));
    expect(actual.length).toBe(expected.length);
    expect(Buffer.compare(actual, expected)).toBe(0);
  });

  test("setup runs before the learner gets the prompt", async () => {
    await startChallenge(node, {
      setup: "mkdir -p /home/learner/logs && echo data > /home/learner/logs/a.log && chown -R learner: /home/learner/logs",
    });
    const { output, exitCode } = await sh("cat logs/a.log");
    expect(exitCode).toBe(0);
    expect(output).toContain("data\r\n");
  });

  test("a failing setup script is reported", async () => {
    await expect(node.session.start({ setup: "echo broken >&2; exit 4" })).rejects.toBeInstanceOf(SetupError);
  });

  test("check passes and fails with the checker's first output line", async () => {
    await startChallenge(node);
    let r = await node.session.check(HELLO_CHECK);
    expect(r).toMatchObject({ passed: false, message: "There is no file ~/hello.txt yet." });

    await sh("echo hello > ~/hello.txt");
    r = await node.session.check(HELLO_CHECK);
    expect(r).toMatchObject({ passed: false, message: "~/hello.txt exists but does not contain exactly: hi" });

    await sh("echo hi > ~/hello.txt");
    r = await node.session.check(HELLO_CHECK);
    expect(r).toMatchObject({ passed: true, message: "Nice, ~/hello.txt says hi." });
  });

  test("reset brings back the pristine state (files, directory, variables)", async () => {
    await startChallenge(node);
    await sh("echo hi > ~/hello.txt; cd /tmp; export LEFTOVER=yes");
    await startChallenge(node);
    const { output } = await sh('echo "pwd=$PWD leftover=${LEFTOVER:-none}"; ls -A ~ | grep -c hello.txt');
    expect(output).toContain("pwd=/home/learner leftover=none");
    expect(output).toMatch(/\r\n0\r\n/);
  });

  test("operations queue: a check issued with a reset runs after the reset", async () => {
    await startChallenge(node);
    await sh("echo hi > ~/hello.txt");
    const reset = node.session.start();
    const check = node.session.check(HELLO_CHECK);
    await reset;
    expect((await check).passed).toBe(false); // the file is gone after the reset
    await startChallenge(node);
  });

  test("resize tells the learner's shell the terminal size", async () => {
    await startChallenge(node, { rows: 30, cols: 100 });
    expect((await sh("stty size")).output).toContain("30 100\r\n");
    await node.session.resize(24, 80);
    expect((await sh("stty size")).output).toContain("24 80\r\n");
  });
});
