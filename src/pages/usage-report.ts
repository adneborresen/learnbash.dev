// Reports what happens on a challenge page as anonymous counts (see
// src/feedback/usage.ts). Failures are ignored: counting must never get in
// the learner's way.
import type { Usage, UsageEvent } from "../feedback/usage.ts";

export const USAGE_URL = "/api/usage";

export const device = (): Usage["device"] => (matchMedia("(pointer: coarse)").matches ? "phone" : "computer");

export function reportUsage(challenge: string, event: UsageEvent): void {
  if (import.meta.env.DEV) return; // no server functions in the dev server
  const usage: Usage = { challenge, event, device: device() };
  fetch(USAGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usage),
    keepalive: true, // still sent when the learner leaves the page
  }).catch(() => {});
}
