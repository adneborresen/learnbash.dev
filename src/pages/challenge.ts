// The challenge page: /challenges/<id>/. Shows the story right away, loads
// the Linux VM in the background, then lets the learner work and Check.
import "../site/site.css";
import "./challenge.css";
import challenges from "virtual:challenges";
import { PARTS } from "../content/parts.ts";
import type { CompiledChallenge } from "../content/schema.ts";
import { TerminalView } from "../engine/terminal-view.ts";
import { SetupError, type VmSession } from "../engine/vm-session.ts";
import { ProgressStore } from "../site/progress.ts";
import { challengeIdFromPath, challengeUrl, HOME_URL } from "../site/routes.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
/** Only on computers: focusing the terminal on a phone would pop up the keyboard. */
const hasFinePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const progress = new ProgressStore();
const index = challenges.findIndex((c) => c.id === challengeIdFromPath(location.pathname));

if (index < 0) {
  $("page").hidden = true;
  $("not-found").hidden = false;
  document.title = "Challenge not found · learnbash.dev";
} else {
  void runChallenge(challenges[index], challenges[index - 1], challenges[index + 1]);
}

async function runChallenge(c: CompiledChallenge, prev?: CompiledChallenge, next?: CompiledChallenge) {
  renderText(c, prev, next);
  setUpHints(c);
  if (progress.isSolved(c.id)) showSolved(false);

  const view = new TerminalView($("term"));
  view.renderKeyBar($("keys"));
  const check = $<HTMLButtonElement>("check");
  const reset = $<HTMLButtonElement>("reset");
  const answer = $<HTMLInputElement>("answer");
  let session: VmSession | undefined;
  let busy = true;

  const setBusy = (value: boolean) => {
    busy = value;
    check.disabled = reset.disabled = value || !session;
  };

  const feedback = (text: string, kind: "" | "pass" | "fail" = "") => {
    const el = $("feedback");
    el.textContent = text;
    el.className = `feedback ${kind}`.trim();
  };

  function showSolved(justNow: boolean) {
    const box = $("solved");
    box.hidden = false;
    $<HTMLDetailsElement>("explanation-box").open = justNow;
    if (justNow) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function startChallenge() {
    setBusy(true);
    try {
      await session!.start({ setup: c.setup, rows: view.rows, cols: view.cols });
      $("loading").hidden = true;
      if (hasFinePointer) view.focus();
    } catch (e) {
      console.error(e);
      feedback(
        e instanceof SetupError
          ? "This challenge couldn't be prepared. Press Reset to try again."
          : "The Linux machine didn't start properly. Press Reset to try again.",
        "fail",
      );
    } finally {
      setBusy(false);
    }
  }

  // Load the VM (large download) without blocking the rest of the page.
  $("retry").addEventListener("click", () => location.reload());
  try {
    const { loadBrowserSession } = await import("../engine/browser-vm.ts");
    const bar = $<HTMLProgressElement>("loading-progress");
    session = await loadBrowserSession({
      onProgress: (loaded, total) => {
        bar.value = loaded / total;
        $("loading-text").textContent = `Downloading Linux… ${Math.floor((100 * loaded) / total)}%`;
      },
    });
    bar.removeAttribute("value"); // indeterminate while booting
    $("loading-text").textContent = "Starting Linux…";
    view.attach(session);
    if (import.meta.env.DEV) (window as unknown as { lbSession: VmSession }).lbSession = session;
  } catch (e) {
    console.error(e);
    $("loading-text").textContent =
      "Linux couldn't be loaded. Check your connection and try again. (It needs a recent browser with WebAssembly.)";
    $("loading-progress").hidden = true;
    $("retry").hidden = false;
    return;
  }
  await startChallenge();

  $("check-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!session || busy) return;
    setBusy(true);
    feedback("Checking…");
    try {
      const r = await session.check(c.checkScript, answer.value.trim());
      if (r.passed) {
        feedback(r.message || "Correct!", "pass");
        progress.markSolved(c.id);
        showSolved(true);
      } else {
        feedback(r.message || "Not yet. Have another look.", "fail");
      }
    } catch (err) {
      console.error(err);
      feedback("The check didn't finish. If the terminal seems stuck, press Reset.", "fail");
    } finally {
      setBusy(false);
    }
  });

  // Reset throws away the learner's work, so it asks for a second click.
  let disarm: ReturnType<typeof setTimeout> | undefined;
  const resetLabel = reset.textContent!;
  reset.addEventListener("click", async () => {
    if (busy) return;
    if (!disarm) {
      reset.textContent = "Click again to start over";
      disarm = setTimeout(() => {
        reset.textContent = resetLabel;
        disarm = undefined;
      }, 4000);
      return;
    }
    clearTimeout(disarm);
    disarm = undefined;
    reset.textContent = resetLabel;
    feedback("");
    await startChallenge();
  });
}

function renderText(c: CompiledChallenge, prev?: CompiledChallenge, next?: CompiledChallenge) {
  document.title = `${c.title} · learnbash.dev`;
  $("concept").textContent = c.concept;
  $("title").textContent = c.title;
  // Trusted HTML: compiled from the repo's Markdown at build time.
  $("story").innerHTML = c.storyHtml;
  $("goal").innerHTML = c.goalHtml;
  $("explanation").innerHTML = c.explanationHtml;
  const part = PARTS.findIndex((p) => p.id === c.module);
  const inPart = challenges.filter((o) => o.module === c.module);
  $("position").textContent = `Part ${part + 1} · ${inPart.indexOf(c) + 1} of ${inPart.length}`;
  for (const [linkId, target] of [["prev", prev], ["next", next]] as const) {
    if (!target) continue;
    const a = $<HTMLAnchorElement>(linkId);
    a.href = challengeUrl(target.id);
    a.title = target.title;
    a.hidden = false;
  }
  const solvedNext = $<HTMLAnchorElement>("solved-next");
  solvedNext.href = next ? challengeUrl(next.id) : HOME_URL;
  solvedNext.textContent = next ? `Next: ${next.title} →` : "See all challenges →";
  if (c.check === "answer") {
    $("answer-row").hidden = false;
    $("answer-label").textContent = c.answerLabel ?? "Answer";
  }
}

/** Hints open one at a time; how many were opened is remembered. */
function setUpHints(c: CompiledChallenge) {
  const list = $("hint-list");
  const button = $<HTMLButtonElement>("hint-button");
  const total = c.hintsHtml.length;
  const update = () => {
    const shown = progress.hintsShown(c.id);
    while (list.children.length < shown) {
      const li = document.createElement("li");
      li.className = "prose";
      li.innerHTML = c.hintsHtml[list.children.length];
      list.append(li);
    }
    button.hidden = shown >= total;
    button.textContent = shown === 0 ? `Show a hint (1 of ${total})` : `Show hint ${shown + 1} of ${total}`;
  };
  button.addEventListener("click", () => {
    progress.setHintsShown(c.id, Math.min(total, progress.hintsShown(c.id) + 1));
    update();
    (list.lastElementChild as HTMLElement | null)?.scrollIntoView({ block: "nearest" });
  });
  update();
}
