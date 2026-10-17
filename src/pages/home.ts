// The landing page: the course with the learner's progress, and a button
// that continues where they left off.
import "../site/site.css";
import "./home.css";
import challenges from "virtual:challenge-index";
import { ProgressStore } from "../site/progress.ts";
import { challengeUrl } from "../site/routes.ts";

const progress = new ProgressStore();
const list = document.getElementById("list")!;
for (const c of challenges) {
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
  list.append(li);
}

const ids = challenges.map((c) => c.id);
const done = progress.solvedCount(ids);
document.getElementById("summary")!.textContent =
  done > 0 ? `You've solved ${done} of ${challenges.length}.` : `${challenges.length} challenges for complete beginners.`;
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
