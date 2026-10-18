// Saves learner feedback (POST /api/feedback, see functions/api/feedback.ts)
// in the Cloudflare D1 database bound as FEEDBACK_DB. Nothing identifies the
// sender: the IP address is only used, hashed together with the date, to limit
// how much one sender can send per day.
import { FEEDBACK_LIMITS, parseFeedback } from "./feedback.ts";

/** The part of Cloudflare's D1 API used here. */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      first<T>(): Promise<T | null>;
    };
  };
}

export interface FeedbackEnv {
  FEEDBACK_DB?: D1Like;
}

const SCHEMA = `CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  challenge TEXT NOT NULL,
  kind TEXT NOT NULL,
  rating TEXT,
  comment TEXT,
  hints INTEGER,
  last_check TEXT,
  device TEXT,
  sender TEXT NOT NULL
)`;

const status = (code: number) => new Response(null, { status: code });

async function senderHash(ip: string, day: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day} ${ip}`)));
  return [...bytes.slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleFeedback(request: Request, env: FeedbackEnv, now = new Date()): Promise<Response> {
  const db = env.FEEDBACK_DB;
  if (!db) return status(503);
  // Only the site's own pages may send feedback.
  if (request.headers.get("Origin") !== new URL(request.url).origin) return status(403);
  if (Number(request.headers.get("Content-Length") ?? 0) > FEEDBACK_LIMITS.body) return status(413);
  const text = await request.text();
  if (text.length > FEEDBACK_LIMITS.body) return status(413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return status(400);
  }
  const feedback = parseFeedback(body);
  if (typeof feedback === "string") return new Response(feedback, { status: 400 });
  if (feedback.spam) return status(204); // the hidden field was filled in: a bot

  const day = now.toISOString().slice(0, 10);
  const sender = await senderHash(request.headers.get("CF-Connecting-IP") ?? "", day);
  await db.prepare(SCHEMA).bind().run();
  const sent = await db
    .prepare("SELECT COUNT(*) AS n FROM feedback WHERE sender = ? AND created_at LIKE ?")
    .bind(sender, `${day}%`)
    .first<{ n: number }>();
  if ((sent?.n ?? 0) >= FEEDBACK_LIMITS.perSenderPerDay) return status(429);

  await db
    .prepare(
      "INSERT INTO feedback (created_at, challenge, kind, rating, comment, hints, last_check, device, sender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      now.toISOString(),
      feedback.challenge,
      feedback.kind,
      feedback.rating ?? null,
      feedback.comment ?? null,
      feedback.hints ?? null,
      feedback.lastCheck ?? null,
      feedback.device ?? null,
      sender,
    )
    .run();
  return status(204);
}
