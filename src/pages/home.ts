// The landing page: the course with the learner's progress, and a button
// that continues where they left off.
import "../site/site.css";
import "./home.css";
import challenges from "virtual:challenge-index";
import { PARTS } from "../content/parts.ts";
import type { ChallengeSummary } from "../content/schema.ts";
import { ProgressStore } from "../site/progress.ts";
import { challengeUrl } from "../site/routes.ts";

const progress = new ProgressStore();
const course = document.getElementById("parts")!;
for (const [n, part] of PARTS.entries()) {
  const inPart = challenges.filter((c) => c.module === part.id);
  const section = document.createElement("section");
  section.className = "part";
  const heading = document.createElement("h3");
  heading.textContent = `Part ${n + 1}: ${part.title}`;
  const summary = document.createElement("p");
  summary.className = "muted";
  const done = progress.solvedCount(inPart.map((c) => c.id));
  summary.textContent = `${part.summary} ${done > 0 ? `${done} of ${inPart.length} solved.` : `${inPart.length} challenges.`}`;
  const list = document.createElement("ol");
  list.className = "challenge-list";
  for (const c of inPart) list.append(challengeItem(c));
  section.append(heading, summary, list);
  course.append(section);
}

function challengeItem(c: ChallengeSummary): HTMLLIElement {
  const solved = progress.isSolved(c.id);
  const li = document.createElement("li");
  li.className = solved ? "solved" : "";
  const a = document.createElement("a");
  a.href = challengeUrl(c.id);
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = c.title;
  const concept = document.createElement("span");
  concept.className = "concept";
  concept.textContent = c.concept;
  a.append(title, concept);
  const mark = document.createElement("span");
  mark.className = "mark";
  mark.textContent = solved ? "✔" : "";
  mark.setAttribute("aria-label", solved ? "solved" : "not solved yet");
  li.append(a, mark);
  return li;
}

const ids = challenges.map((c) => c.id);
const done = progress.solvedCount(ids);
document.getElementById("summary")!.textContent =
  done > 0 ? `You've solved ${done} of ${challenges.length}.` : `${challenges.length} short challenges for complete beginners. Each one starts on a fresh machine.`;
if (done > 0) {
  const next = challenges.find((c) => !progress.isSolved(c.id));
  const start = document.getElementById("start") as HTMLAnchorElement;
  if (next) {
    start.href = challengeUrl(next.id);
    start.textContent = `Continue: ${next.title} →`;
  } else {
    start.href = "#challenges";
    start.textContent = "All solved! Review the challenges →";
  }
}
