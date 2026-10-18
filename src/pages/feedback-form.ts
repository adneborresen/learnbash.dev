// Feedback on the challenge page: a thumb (and optional comment) after
// solving, and "Something wrong or confusing?" next to the hints.
import { FEEDBACK_LIMITS, type Feedback } from "../feedback/feedback.ts";

export const FEEDBACK_URL = "/api/feedback";

/** What is sent along with every message. */
export interface FeedbackContext {
  hints: number;
  lastCheck: string;
}

const device = (): Feedback["device"] => (matchMedia("(pointer: coarse)").matches ? "phone" : "computer");

async function send(data: Feedback & { website?: string }): Promise<boolean> {
  try {
    const r = await fetch(FEEDBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return r.ok;
  } catch {
    return false;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

export function setUpFeedback(challenge: string, context: () => FeedbackContext) {
  const base = () => {
    const { hints, lastCheck } = context();
    return { challenge, hints, lastCheck: lastCheck.slice(0, FEEDBACK_LIMITS.lastCheck) || undefined, device: device() };
  };
  const report = (statusId: string, ok: boolean) => {
    $(statusId).textContent = ok ? "Thanks! Your feedback was sent." : "Sorry, that didn't work. Please try again later.";
  };

  // After solving: one tap sends the rating; a comment can follow.
  let rating: Feedback["rating"];
  const thumbs = [...document.querySelectorAll<HTMLButtonElement>("#rate [data-rating]")];
  for (const thumb of thumbs) {
    thumb.addEventListener("click", async () => {
      rating = thumb.dataset.rating as Feedback["rating"];
      for (const t of thumbs) {
        t.setAttribute("aria-pressed", String(t === thumb));
        t.disabled = true;
      }
      $("rate-form").hidden = false;
      report("rate-status", await send({ ...base(), kind: "rating", rating }));
    });
  }
  setUpForm("rate-form", "rate-comment", async (comment, website) => {
    const ok = await send({ ...base(), kind: "comment", rating, comment, website });
    report("rate-status", ok);
    return ok;
  });

  // While working on it.
  setUpForm("report-form", "report-text", async (comment, website) => {
    const ok = await send({ ...base(), kind: "problem", comment, website });
    report("report-status", ok);
    return ok;
  });
}

function setUpForm(formId: string, textId: string, submit: (comment: string, website: string) => Promise<boolean>) {
  const form = $<HTMLFormElement>(formId);
  const text = $<HTMLTextAreaElement>(textId);
  text.maxLength = FEEDBACK_LIMITS.comment;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (text.value.trim() === "") return;
    const button = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
    button.disabled = true;
    const website = form.querySelector<HTMLInputElement>("input[name=website]")?.value ?? "";
    if (await submit(text.value, website)) form.hidden = true;
    else button.disabled = false;
  });
}
