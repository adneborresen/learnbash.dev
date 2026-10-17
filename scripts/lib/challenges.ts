// Loads, validates and compiles the challenges in challenges/. Used by the
// Vite build (virtual:challenges), the challenge tests and content checks.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import {
  challengeMetaSchema,
  SECTIONS,
  type ChallengeMeta,
  type CompiledChallenge,
} from "../../src/content/schema.ts";
import { ROOT } from "./paths.ts";

export const CHALLENGES_DIR = path.join(ROOT, "challenges");
const FOLDER = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** A wrong attempt that the checker must reject. */
export interface WrongCase {
  name: string;
  /** Command lines typed into the learner's shell (from wrong/NAME.sh). */
  commands: string[];
  /** Answer typed into the answer box (from wrong/NAME.answer). */
  answer?: string;
}

export interface LoadedChallenge {
  dir: string;
  folder: string;
  meta: ChallengeMeta;
  order: number;
  /** Markdown of each section (TODO-REVIEW comments included). */
  sections: Record<(typeof SECTIONS)[number], string>;
  setup: string;
  check: string;
  /** Reference solution: command lines typed into the learner's shell. */
  solution: string[];
  wrong: WrongCase[];
}

export interface TodoReview {
  file: string;
  line: number;
  text: string;
}

export interface LoadResult {
  challenges: LoadedChallenge[];
  errors: string[];
}

/** Command lines of a typed script: no blank lines or full-line comments. */
export function commandLines(script: string): string[] {
  return script
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== "" && !l.trimStart().startsWith("#"));
}

function splitFrontMatter(text: string): { yaml: string; body: string } | undefined {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  return m ? { yaml: m[1], body: m[2] } : undefined;
}

function splitSections(body: string, errors: string[], where: string): LoadedChallenge["sections"] | undefined {
  const found: Array<[string, string]> = [];
  const parts = body.split(/^## +(.+?)\s*$/m);
  if (parts[0].trim() !== "") errors.push(`${where}: text before the first "## " heading`);
  for (let i = 1; i < parts.length; i += 2) found.push([parts[i], parts[i + 1].trim()]);
  const names = found.map(([n]) => n);
  if (names.join("|") !== SECTIONS.join("|")) {
    errors.push(`${where}: sections must be exactly ${SECTIONS.map((s) => `"## ${s}"`).join(", ")} in this order; found ${names.map((n) => `"## ${n}"`).join(", ") || "none"}`);
    return undefined;
  }
  for (const [name, text] of found) {
    if (text.replace(HTML_COMMENT, "").trim() === "") errors.push(`${where}: section "## ${name}" is empty`);
  }
  return Object.fromEntries(found) as LoadedChallenge["sections"];
}

function readOptional(file: string): string | undefined {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n") : undefined;
}

function loadOne(dir: string, folder: string, order: number, errors: string[]): LoadedChallenge | undefined {
  const where = `challenges/${folder}`;
  const before = errors.length;
  const md = readOptional(path.join(dir, "challenge.md"));
  if (md === undefined) {
    errors.push(`${where}: missing challenge.md`);
    return undefined;
  }
  const fm = splitFrontMatter(md);
  if (!fm) {
    errors.push(`${where}/challenge.md: must start with front matter between "---" lines`);
    return undefined;
  }
  let meta: ChallengeMeta | undefined;
  try {
    const parsed = challengeMetaSchema.safeParse(parseYaml(fm.yaml));
    if (parsed.success) meta = parsed.data;
    else for (const issue of parsed.error.issues) errors.push(`${where}/challenge.md: ${issue.path.join(".") || "front matter"}: ${issue.message}`);
  } catch (e) {
    errors.push(`${where}/challenge.md: invalid YAML: ${(e as Error).message}`);
  }
  const slug = FOLDER.exec(folder)![2];
  if (meta && meta.id !== slug) errors.push(`${where}: id "${meta.id}" must match the folder name "${slug}"`);
  const sections = splitSections(fm.body, errors, `${where}/challenge.md`);

  const files: Record<string, string | undefined> = {};
  for (const f of ["setup.sh", "check.sh", "solution.sh"]) {
    files[f] = readOptional(path.join(dir, f));
    if (files[f] === undefined) errors.push(`${where}: missing ${f}`);
  }
  const solution = commandLines(files["solution.sh"] ?? "");
  if (files["solution.sh"] !== undefined && solution.length === 0) errors.push(`${where}/solution.sh: no commands`);

  const wrong: WrongCase[] = [];
  const wrongDir = path.join(dir, "wrong");
  const names = fs.existsSync(wrongDir)
    ? [...new Set(fs.readdirSync(wrongDir).map((f) => f.replace(/\.(sh|answer)$/, "")))].sort()
    : [];
  for (const name of names) {
    const sh = readOptional(path.join(wrongDir, `${name}.sh`));
    const answer = readOptional(path.join(wrongDir, `${name}.answer`))?.trim();
    if (sh === undefined && answer === undefined) {
      errors.push(`${where}/wrong/${name}: only .sh and .answer files are allowed`);
      continue;
    }
    if (meta?.check === "answer" && answer === undefined) errors.push(`${where}/wrong/${name}: answer challenges need a ${name}.answer file`);
    if (meta?.check === "state" && answer !== undefined) errors.push(`${where}/wrong/${name}.answer: only answer challenges take answers`);
    if (meta?.check === "state" && commandLines(sh ?? "").length === 0) errors.push(`${where}/wrong/${name}.sh: no commands`);
    wrong.push({ name, commands: commandLines(sh ?? ""), answer });
  }
  if (wrong.length === 0) errors.push(`${where}: add at least one common wrong attempt in wrong/ (it must fail the checker)`);

  if (errors.length > before || !meta || !sections) return undefined;
  return {
    dir,
    folder,
    meta,
    order,
    sections,
    setup: files["setup.sh"]!,
    check: files["check.sh"]!,
    solution,
    wrong,
  };
}

/** Loads every challenge folder and validates each one and the course as a whole. */
export function loadChallenges(dir = CHALLENGES_DIR): LoadResult {
  const errors: string[] = [];
  const challenges: LoadedChallenge[] = [];
  const folders = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];
  const orders = new Map<number, string>();
  for (const folder of folders) {
    const m = FOLDER.exec(folder);
    if (!m) {
      errors.push(`challenges/${folder}: folder name must look like "01-some-name"`);
      continue;
    }
    const order = Number(m[1]);
    if (orders.has(order)) errors.push(`challenges/${folder}: number ${m[1]} is also used by ${orders.get(order)}`);
    orders.set(order, folder);
    const c = loadOne(path.join(dir, folder), folder, order, errors);
    if (c) challenges.push(c);
  }

  // Course-level checks: ids are unique, and a challenge only reuses
  // things an earlier challenge introduced (smooth difficulty curve).
  const ids = new Set<string>();
  const introducedBy = new Map<string, string>();
  for (const c of challenges) {
    if (ids.has(c.meta.id)) errors.push(`challenges/${c.folder}: duplicate id "${c.meta.id}"`);
    ids.add(c.meta.id);
    for (const item of c.meta.reuses) {
      if (!introducedBy.has(item)) errors.push(`challenges/${c.folder}: reuses "${item}", which no earlier challenge introduces`);
    }
    for (const item of c.meta.introduces) {
      if (introducedBy.has(item)) errors.push(`challenges/${c.folder}: introduces "${item}", already introduced by ${introducedBy.get(item)}`);
      else introducedBy.set(item, c.folder);
    }
  }
  return { challenges, errors };
}

function renderMarkdown(markdown: string): string {
  return marked.parse(markdown.replace(HTML_COMMENT, ""), { async: false });
}

/** The form shipped to the website. */
export function compileChallenge(c: LoadedChallenge): CompiledChallenge {
  return {
    id: c.meta.id,
    order: c.order,
    title: c.meta.title,
    module: c.meta.module,
    concept: c.meta.concept,
    introduces: c.meta.introduces,
    reuses: c.meta.reuses,
    check: c.meta.check,
    answerLabel: c.meta.answer_label,
    storyHtml: renderMarkdown(c.sections.Story),
    goalHtml: renderMarkdown(c.sections.Goal),
    hintsHtml: [c.sections["Hint 1"], c.sections["Hint 2"], c.sections["Hint 3"]].map(renderMarkdown),
    explanationHtml: renderMarkdown(c.sections.Explanation),
    setup: c.setup,
    checkScript: c.check,
  };
}

/** Every TODO-REVIEW marker in the content and docs, for expert review. */
export function findTodoReviews(): TodoReview[] {
  const out: TodoReview[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(md|sh|answer)$/.test(e.name)) {
        // In Markdown, skip fenced code blocks (examples, not real markers).
        let inFence = false;
        fs.readFileSync(p, "utf8").split("\n").forEach((text, i) => {
          if (e.name.endsWith(".md") && text.trimStart().startsWith("```")) inFence = !inFence;
          if (!inFence && text.includes("TODO-REVIEW")) {
            out.push({ file: path.relative(ROOT, p).replace(/\\/g, "/"), line: i + 1, text: text.trim() });
          }
        });
      }
    }
  };
  for (const d of ["challenges", "docs", "image"]) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d));
  return out;
}
