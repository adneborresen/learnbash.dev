// Content tooling that needs no VM: the TODO-REVIEW scanner (npm run todo-review)
// and the course-level checks of the challenge loader.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect, test } from "vitest";
import { findTodoReviews, loadChallenges } from "../scripts/lib/challenges.ts";

// Built at runtime so this file doesn't show up in the real scan.
const M = ["TODO", "REVIEW"].join("-");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "learnbash-todo-"));
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

function write(file: string, text: string) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
}

test("finds markers in content, docs, code and config, and nowhere else", () => {
  write("challenges/01-x/challenge.md", `Text. <!-- ${M}: true everywhere? -->\n\`\`\`\nexample <!-- ${M}: in a code block -->\n\`\`\`\n`);
  write("public/_headers", `# ${M}: right hosts?\n/*\n  X-Test: 1\n`);
  write("image/Dockerfile", `FROM alpine\n# ${M}: pin?\n`);
  write("scripts/a.ts", `// ${M}: check\nconst s = 'lists ${M} markers'; // mentions it, not a marker\n`);
  write("docs/notes.md", `Ask an expert to go through the ${M} list.\n`);
  write("node_modules/pkg/x.md", `<!-- ${M}: not ours -->\n`);
  write("dist/index.html", `<!-- ${M}: build output -->\n`);
  write("public/vm/vm.json", `{"note": "# ${M} generated"}\n`);

  expect(findTodoReviews(root).map((t) => `${t.file}:${t.line}`).sort()).toEqual([
    "challenges/01-x/challenge.md:1",
    "image/Dockerfile:2",
    "public/_headers:1",
    "scripts/a.ts:1",
  ]);
});

function challenge(dir: string, folder: string, part: string) {
  const id = folder.slice(3);
  const sections = ["Story", "Goal", "Hint 1", "Hint 2", "Hint 3", "Explanation"].map((s) => `## ${s}\nText.\n`).join("\n");
  write(`${dir}/${folder}/challenge.md`, `---\nid: ${id}\ntitle: Title of ${id}\nmodule: ${part}\nconcept: Something\nintroduces: [${id}]\ncheck: state\n---\n\n${sections}`);
  for (const f of ["setup.sh", "check.sh", "solution.sh", "wrong/nothing.sh"]) write(`${dir}/${folder}/${f}`, "true\n");
}

test("a part's challenges are numbered together, in the order of the parts", () => {
  challenge("ok", "01-a", "find-your-way");
  challenge("ok", "05-b", "find-your-way");
  challenge("ok", "07-c", "incident");
  expect(loadChallenges(path.join(root, "ok")).errors).toEqual([]);

  challenge("split", "01-a", "find-your-way");
  challenge("split", "02-b", "incident");
  challenge("split", "03-c", "find-your-way");
  expect(loadChallenges(path.join(root, "split")).errors).toEqual([
    'challenges/03-c: part "find-your-way" continues after challenges of another part; number a part\'s challenges together',
  ]);

  challenge("swapped", "01-a", "incident");
  challenge("swapped", "02-b", "find-your-way");
  expect(loadChallenges(path.join(root, "swapped")).errors).toEqual([
    'challenges/02-b: part "find-your-way" comes before "incident" in src/content/parts.ts, so its challenges must be numbered first',
  ]);
});
