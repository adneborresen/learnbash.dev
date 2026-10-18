// Anonymous usage counts: the challenge page reports what happens (POST
// /api/usage) and the server only adds 1 to a counter per day, challenge,
// event and phone/computer. Nothing about the visitor is sent or stored.

export const USAGE_EVENTS = [
  "opened", // the challenge page was opened
  "started", // Linux is running and the challenge is set up
  "load-failed", // Linux couldn't be loaded or started
  "checked", // Check was pressed
  "solved", // solved for the first time in this browser
  "hint-1",
  "hint-2",
  "hint-3",
  "reset",
] as const;

export type UsageEvent = (typeof USAGE_EVENTS)[number];

export interface Usage {
  challenge: string;
  event: UsageEvent;
  device: "phone" | "computer";
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function parseUsage(body: unknown): Usage | string {
  if (!isObject(body)) return "expected an object";
  const { challenge, event, device } = body;
  if (typeof challenge !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(challenge) || challenge.length > 60) return "bad challenge";
  if (!USAGE_EVENTS.includes(event as UsageEvent)) return "bad event";
  if (device !== "phone" && device !== "computer") return "bad device";
  return { challenge, event: event as UsageEvent, device };
}
