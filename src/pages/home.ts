// The home page: the list of challenges with the learner's progress.
// (A placeholder until the real landing page in M6.)
import "../site/site.css";
import "./home.css";
import challenges from "virtual:challenges";
import { ProgressStore } from "../site/progress.ts";
import { challengeUrl } from "../site/routes.ts";

const progress = new ProgressStore();
const list = document.getElementById("list")!;
for (const c of challenges) {
  const li = document.createElement("li");
  const solved = progress.isSolved(c.id);
  li.className = solved ? "solved" : "";
  const a = document.createElement("a");
  a.href = challengeUrl(c.id);
  a.textContent = c.title;
  const concept = document.createElement("span");
  concept.className = "concept";
  concept.textContent = c.concept;
  li.append(a, concept);
  if (solved) {
    const mark = document.createElement("span");
    mark.className = "mark";
    mark.textContent = "✔ solved";
    li.append(mark);
  }
  list.append(li);
}
const done = progress.solvedCount(challenges.map((c) => c.id));
document.getElementById("summary")!.textContent =
  done === 0 ? "Start with the first challenge." : `You've solved ${done} of ${challenges.length}.`;
