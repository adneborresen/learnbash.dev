// What the challenge page sends to /api/feedback, shared by the page and the
// server so both agree on the rules.

export const FEEDBACK_LIMITS = {
  comment: 2000,
  lastCheck: 300,
  body: 8000,
  perSenderPerDay: 30,
} as const;

export interface Feedback {
  challenge: string;
  /** "rating": a thumb after solving; "comment": what the learner added to it; "problem": a report. */
  kind: "rating" | "comment" | "problem";
  rating?: "up" | "down";
  comment?: string;
  /** How many hints the learner had opened. */
  hints?: number;
  /** The last Check result shown. */
  lastCheck?: string;
  device?: "phone" | "computer";
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** The feedback, or what's wrong with it. `spam` is set when the hidden honeypot field was filled in. */
export function parseFeedback(body: unknown): (Feedback & { spam: boolean }) | string {
  if (!isObject(body)) return "expected an object";
  const { challenge, kind, rating, comment, hints, lastCheck, device, website } = body;
  if (typeof challenge !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(challenge) || challenge.length > 60) return "bad challenge";
  if (kind !== "rating" && kind !== "comment" && kind !== "problem") return "bad kind";
  if (rating !== undefined && rating !== "up" && rating !== "down") return "bad rating";
  if (kind !== "problem" && rating === undefined) return "a rating is needed";
  if (comment !== undefined && (typeof comment !== "string" || comment.length > FEEDBACK_LIMITS.comment)) return "bad comment";
  if (kind !== "rating" && (typeof comment !== "string" || comment.trim() === "")) return "a comment is needed";
  if (hints !== undefined && (!Number.isInteger(hints) || (hints as number) < 0 || (hints as number) > 10)) return "bad hints";
  if (lastCheck !== undefined && (typeof lastCheck !== "string" || lastCheck.length > FEEDBACK_LIMITS.lastCheck)) return "bad lastCheck";
  if (device !== undefined && device !== "phone" && device !== "computer") return "bad device";
  return {
    challenge,
    kind,
    rating,
    comment: typeof comment === "string" ? comment.trim() : undefined,
    hints: hints as number | undefined,
    lastCheck: lastCheck as string | undefined,
    device,
    spam: typeof website === "string" && website !== "",
  };
}
