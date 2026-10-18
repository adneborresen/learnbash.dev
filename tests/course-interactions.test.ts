import { afterAll, beforeAll, expect, test } from "vitest";
import { loadChallenges } from "../scripts/lib/challenges.ts";
import { createSession, startChallenge, type NodeSession } from "../scripts/lib/node-vm.ts";

const { challenges } = loadChallenges();
const recovery = challenges.find((c) => c.meta.id === "get-your-prompt-back")!;
let node: NodeSession;
beforeAll(async () => { node = await createSession(); });
afterAll(async () => { await node?.destroy(); });

for (const [name, key] of [["Ctrl+C", "\x03"], ["Ctrl+D", "\x04"]]) {
  test(`${name} recovers from cat; a correct answer while waiting is rejected`, async () => {
    await startChallenge(node, { setup: recovery.setup });
    node.session.sendInput("cat\n");
    // expect.poll gives up after 1 s by default; a busy machine needs longer.
    await expect.poll(async () => (await node.session.agent.run("ps -t ttyS0 -o comm=")).out, { timeout: 30_000 }).toMatch(/^cat$/m);
    node.session.sendInput("^C\n"); // Typing the notation does not interrupt cat.
    const waiting = await node.session.check(recovery.check, recovery.meta.expected_answer!);
    expect(waiting.passed).toBe(false);
    expect(waiting.message).toContain("Ctrl+C");
    const prompt = node.terminal.waitFor("$ ");
    node.session.sendInput(key);
    await prompt;
    expect((await node.session.check(recovery.check, recovery.meta.expected_answer!)).passed).toBe(true);
  });
}

test("common answer mistakes get feedback about the mistake they made", async () => {
  const count = challenges.find((c) => c.meta.id === "how-many-errors")!;
  await startChallenge(node, { setup: count.setup });
  for (const [name, command, feedback] of [
    ["ignored-case", "grep -i ERROR /home/learner/logs/app.log | wc -l", "lowercase error"],
    ["all-lines", "wc -l < /home/learner/logs/app.log", "whole file"],
    ["counted-words", "grep ERROR /home/learner/logs/app.log | wc -w", "words"],
  ]) {
    const answer = count.wrong.find((attempt) => attempt.name === name)!.answer!;
    expect((await node.session.agent.run(command)).out.trim()).toBe(answer.trim());
    for (const input of [answer, `+000${answer.trim()}`]) {
      const result = await node.session.check(count.check, input);
      expect(result.passed).toBe(false);
      expect(result.message).toContain(feedback);
    }
  }
  const boundaries = challenges.find((c) => c.meta.id === "first-and-last-lines")!;
  await startChallenge(node, { setup: boundaries.setup });
  for (const answer of ["investigating", "Investigating"]) {
    const result = await node.session.check(boundaries.check, answer);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("capitals");
  }
});

test("incident exercises restore identical source evidence and deliberate sorting traps", async () => {
  let appHash: string | undefined;
  let accessHash: string | undefined;
  for (const id of ["first-and-last-lines", "which-log-broke", "count-the-lines", "how-many-errors", "save-the-evidence", "write-the-report", "put-lines-in-order", "count-repeat-visits", "top-visitor", "incident-handover"]) {
    const c = challenges.find((item) => item.meta.id === id)!;
    await startChallenge(node, { setup: c.setup });
    const appPath = id === "which-log-broke" ? "/home/learner/incident/web-06.log" : "/home/learner/logs/app.log";
    const files = await node.session.agent.run(`test ! -f ${appPath} || sha256sum ${appPath}\ntest ! -f /home/learner/access.log || sha256sum /home/learner/access.log`);
    for (const line of files.out.split("\n")) {
      const hash = line.split(/\s+/)[0];
      if (line.endsWith(appPath)) {
        appHash ??= hash;
        expect(hash, id).toBe(appHash);
      }
      if (line.endsWith("/access.log")) {
        accessHash ??= hash;
        expect(hash, id).toBe(accessHash);
      }
    }
    if (id === "top-visitor") {
      const textLeader = await node.session.agent.run("sort -r /home/learner/visit-counts.txt | head -n 1");
      const numericLeader = await node.session.agent.run("sort -nr /home/learner/visit-counts.txt | head -n 1");
      expect(textLeader.out).toBe("9 198.51.100.23");
      expect(numericLeader.out).toBe("40 203.0.113.42");
      const smallest = c.wrong.find((attempt) => attempt.name === "smallest-first")!;
      const smallestOutput = await node.session.agent.run(`cd /home/learner\n${smallest.commands.join("\n")}`);
      expect(smallestOutput.out.trim()).toBe(`2 ${smallest.answer!.trim()}`);
    }
  }
  const totals = await node.session.agent.run("cd /home/learner\nwc -l < logs/app.log\ngrep -c ERROR logs/app.log\ngrep -c WARN logs/app.log\nwc -l < access.log");
  expect(totals.out).toBe("500\n71\n39\n88");
  expect((await node.session.agent.run("uniq -c /home/learner/access.log | sort -nr | head -n 1")).out.trim()).toBe("25 198.51.100.7");
}, 120_000);
