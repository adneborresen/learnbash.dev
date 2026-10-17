// Environment tests: prove the VM image is what the lessons assume.
// Everything learner-facing is checked through the learner's real shell on
// the terminal, so PATH, aliases and BusyBox shadowing are tested for real.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { startFromSnapshot, typeCommand, type NodeVm } from "../scripts/lib/node-vm.ts";

let node: NodeVm;
beforeAll(async () => {
  node = await startFromSnapshot();
});
afterAll(async () => {
  await node?.destroy();
});

const sh = (line: string) => typeCommand(node, line);

describe("learner-facing tools are GNU, not BusyBox", () => {
  const tools: Array<[string, RegExp]> = [
    ["bash", /GNU bash, version 5\./],
    ["grep", /\(GNU grep\)/],
    ["find", /\(GNU findutils\)/],
    ["xargs", /\(GNU findutils\)/],
    ["sed", /\(GNU sed\)/],
    ["awk", /GNU Awk/],
    ["diff", /\(GNU diffutils\)/],
    ["less", /^less \d+/m],
    ...[
      "ls", "cat", "cp", "mv", "rm", "mkdir", "rmdir", "touch", "chmod", "stat",
      "wc", "sort", "uniq", "head", "tail", "cut", "tr", "echo", "pwd", "date",
    ].map((t): [string, RegExp] => [t, /\(GNU coreutils\)/]),
  ];
  for (const [tool, expected] of tools) {
    test(tool, async () => {
      // `type -P` finds the executable the learner would run (not a builtin).
      const { output, exitCode } = await sh(
        `p=$(type -P ${tool}); echo "path=$(readlink -f "$p")"; "$p" --version | head -n 3`,
      );
      expect(exitCode).toBe(0);
      expect(output).not.toMatch(/path=\S*busybox/);
      expect(output).toMatch(expected);
    });
  }
});

describe("learner session", () => {
  test("runs as the unprivileged user learner in its home directory", async () => {
    const { output } = await sh(`echo "who=$(id -un) uid=$(id -u) pwd=$PWD"`);
    expect(output).toMatch(/who=learner uid=[1-9]\d* pwd=\/home\/learner/);
  });

  test("prompt looks like a normal Linux prompt", async () => {
    const { output } = await sh("true");
    expect(output).toContain("learner@learnbash:~$ ");
  });

  test("cannot read root's or the agent's private directories", async () => {
    expect((await sh("ls /root")).exitCode).not.toBe(0);
    expect((await sh("ls /run/learnbash")).exitCode).not.toBe(0);
  });

  test("terminal type is xterm-256color and its terminfo entry exists", async () => {
    const { output } = await sh(
      `echo "term=$TERM"; ls /etc/terminfo/x/xterm-256color /usr/share/terminfo/x/xterm-256color 2>/dev/null | head -n1`,
    );
    expect(output).toContain("term=xterm-256color");
    expect(output).toMatch(/terminfo\/x\/xterm-256color/);
  });

  test("clock is set from the host after restoring the snapshot", async () => {
    const { output } = await sh(`date -u +year=%Y`);
    expect(output).toContain(`year=${new Date().getUTCFullYear()}`);
  });

  // Lessons rely on this: musl has no locale collation, so sort uses byte
  // order (uppercase before lowercase), like LC_ALL=C on other systems.
  test("sort uses byte order", async () => {
    const { output } = await sh(`printf 'b\nB\na\nA\n' | sort | tr '\n' ' '; echo`);
    expect(output).toContain("A B a b \r\n");
  });
});

describe("guest agent", () => {
  test("answers PING", async () => {
    expect(await node.agent.send("PING")).toEqual({ code: 0, out: "pong" });
  });

  test("runs scripts as root and reports their exit code and output", async () => {
    const r = await node.agent.run(`id -un; echo oops >&2; exit 3`);
    expect(r.code).toBe(3);
    expect(r.out).toBe("root\noops");
  });

  test("passes the learner's answer in $ANSWER, unchanged", async () => {
    const answer = `it's "tricky" $HOME *`;
    const r = await node.agent.run(`printf '%s' "$ANSWER"`, answer);
    expect(r.out).toBe(answer);
  });

  test("rejects unknown commands", async () => {
    expect((await node.agent.send("NOPE" as "PING")).code).toBe(127);
  });

  test("learner_cwd reports the learner shell's current directory", async () => {
    await sh("cd /tmp");
    const r = await node.agent.run(`. /usr/local/lib/learnbash/check-lib.sh; learner_cwd`);
    expect(r.out).toBe("/tmp");
    await sh("cd ~");
  });

  test("kills scripts that run longer than 10 seconds", async () => {
    const r = await node.agent.run("sleep 30");
    expect(r.code).toBe(124); // exit code of `timeout`
  }, 30000);
});
