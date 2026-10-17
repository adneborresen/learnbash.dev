// Every challenge is proven against the real VM before it can be published:
//   1. the untouched starting state does NOT pass the checker,
//   2. the reference solution, typed into the learner's shell, passes,
//   3. every common wrong attempt in wrong/ fails,
//   4. setup is deterministic (same files every time).
// Run one challenge:  npx vitest run tests/challenges.test.ts -t 01-look-around
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { loadChallenges, type LoadedChallenge } from "../scripts/lib/challenges.ts";
import { createSession, startChallenge, typeCommand, type NodeSession } from "../scripts/lib/node-vm.ts";

const { challenges, errors } = loadChallenges();

let node: NodeSession;
beforeAll(async () => {
  node = await createSession();
});
afterAll(async () => {
  await node?.destroy();
});

test("all challenges are valid", () => {
  expect(errors).toEqual([]);
});

async function start(c: LoadedChallenge) {
  await startChallenge(node, { setup: c.setup });
}

async function typeAll(commands: string[]): Promise<string> {
  let output = "";
  for (const line of commands) output += (await typeCommand(node, line)).output;
  return output;
}

// Fingerprint of the learner's files (names, types, permissions, contents).
const FINGERPRINT = `cd /home/learner && find . -printf '%y %m %u %p\\n' | LC_ALL=C sort | sha256sum
find . -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha256sum | sha256sum`;

for (const c of challenges) {
  describe(c.folder, () => {
    test("the starting state does not pass", async () => {
      await start(c);
      const r = await node.session.check(c.check, "");
      expect(r.passed, `checker passed without the learner doing anything: ${r.output}`).toBe(false);
    });

    test("the reference solution passes", async () => {
      await start(c);
      const output = await typeAll(c.solution);
      const answer = c.meta.expected_answer ?? "";
      if (c.meta.check === "answer") {
        // The solution's commands must actually reveal the answer.
        expect(output, "the solution's output should show the expected answer").toContain(answer);
      }
      const r = await node.session.check(c.check, answer);
      expect(r.passed, `checker said: ${r.output}`).toBe(true);
      expect(r.message.trim(), "the checker should print a message for the learner").not.toBe("");
    });

    if (c.meta.check === "answer") {
      test("the expected answer passes with stray spaces around it", async () => {
        await start(c);
        const r = await node.session.check(c.check, `  ${c.meta.expected_answer}  \n`);
        expect(r.passed, `checker said: ${r.output}`).toBe(true);
      });
    }

    for (const w of c.wrong) {
      test(`wrong attempt "${w.name}" fails`, async () => {
        await start(c);
        await typeAll(w.commands);
        const r = await node.session.check(c.check, w.answer ?? "");
        expect(r.passed, `checker accepted a wrong attempt: ${r.output}`).toBe(false);
        expect(r.message.trim(), "a failing check should tell the learner why").not.toBe("");
      });
    }

    test("setup is deterministic", async () => {
      await start(c);
      const a = await node.session.agent.run(FINGERPRINT);
      await start(c);
      const b = await node.session.agent.run(FINGERPRINT);
      expect(a.code).toBe(0);
      expect(b.out).toBe(a.out);
    });
  });
}
