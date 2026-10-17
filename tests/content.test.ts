// Content tooling that needs no VM: the TODO-REVIEW scanner (npm run todo-review).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect, test } from "vitest";
import { findTodoReviews } from "../scripts/lib/challenges.ts";

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
