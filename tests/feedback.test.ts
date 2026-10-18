// The feedback endpoint (src/feedback/server.ts), with SQLite standing in for
// Cloudflare D1 (both are SQLite, so the SQL is tested as it runs there).
import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { FEEDBACK_LIMITS } from "../src/feedback/feedback.ts";
import { handleFeedback, type D1Like } from "../src/feedback/server.ts";

function fakeD1() {
  const sqlite = new DatabaseSync(":memory:");
  const db: D1Like = {
    prepare: (sql) => ({
      bind: (...values) => {
        const stmt = sqlite.prepare(sql);
        const args = values as Array<string | number | null>;
        return {
          run: async () => stmt.run(...args),
          first: async <T,>() => (stmt.get(...args) as T | undefined) ?? null,
        };
      },
    }),
  };
  const rows = () => sqlite.prepare("SELECT * FROM feedback ORDER BY id").all() as Array<Record<string, unknown>>;
  return { db, rows };
}

const ORIGIN = "https://learnbash.dev";
const NOW = new Date("2026-10-18T12:00:00Z");

function post(body: unknown, { origin = ORIGIN, ip = "203.0.113.7" } = {}) {
  return new Request(`${ORIGIN}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const problem = { challenge: "back-on-track", kind: "problem", comment: "  Hint 3 failed for me  ", hints: 2, lastCheck: "You're in ~/projects.", device: "phone" };

test("saves a report with its context, without the sender's address", async () => {
  const { db, rows } = fakeD1();
  expect((await handleFeedback(post(problem), { FEEDBACK_DB: db }, NOW)).status).toBe(204);
  expect((await handleFeedback(post({ challenge: "look-around", kind: "rating", rating: "up" }), { FEEDBACK_DB: db }, NOW)).status).toBe(204);
  const [report, rating] = rows();
  expect(report).toMatchObject({
    created_at: "2026-10-18T12:00:00.000Z",
    challenge: "back-on-track",
    kind: "problem",
    rating: null,
    comment: "Hint 3 failed for me",
    hints: 2,
    last_check: "You're in ~/projects.",
    device: "phone",
  });
  expect(report.sender).toMatch(/^[0-9a-f]{24}$/);
  expect(JSON.stringify(rows())).not.toContain("203.0.113.7");
  expect(rating).toMatchObject({ challenge: "look-around", kind: "rating", rating: "up", comment: null });
});

test("rejects invalid feedback", async () => {
  const { db, rows } = fakeD1();
  const send = (body: unknown) => handleFeedback(post(body), { FEEDBACK_DB: db }, NOW).then((r) => r.status);
  expect(await send("not json")).toBe(400);
  expect(await send({ ...problem, challenge: "../etc" })).toBe(400);
  expect(await send({ ...problem, kind: "praise" })).toBe(400);
  expect(await send({ ...problem, comment: "   " })).toBe(400);
  expect(await send({ challenge: "look-around", kind: "rating" })).toBe(400);
  expect(await send({ ...problem, hints: -1 })).toBe(400);
  expect(await send({ ...problem, comment: "x".repeat(FEEDBACK_LIMITS.comment + 1) })).toBe(400);
  expect(await send({ ...problem, comment: "x".repeat(FEEDBACK_LIMITS.body) })).toBe(413);
  expect(rows).toThrow(); // nothing valid arrived, so the table was never even created
});

test("only accepts feedback from the site's own pages", async () => {
  const { db } = fakeD1();
  expect((await handleFeedback(post(problem, { origin: "https://evil.example" }), { FEEDBACK_DB: db }, NOW)).status).toBe(403);
});

test("quietly drops messages that filled in the hidden field", async () => {
  const { db, rows } = fakeD1();
  expect((await handleFeedback(post({ ...problem, website: "http://spam.example" }), { FEEDBACK_DB: db }, NOW)).status).toBe(204);
  expect(rows).toThrow();
});

test("limits how much one sender can send per day", async () => {
  const { db, rows } = fakeD1();
  const send = (ip: string, now = NOW) => handleFeedback(post(problem, { ip }), { FEEDBACK_DB: db }, now).then((r) => r.status);
  for (let i = 0; i < FEEDBACK_LIMITS.perSenderPerDay; i++) expect(await send("198.51.100.1")).toBe(204);
  expect(await send("198.51.100.1")).toBe(429);
  expect(await send("198.51.100.2")).toBe(204); // someone else
  expect(await send("198.51.100.1", new Date("2026-10-19T00:00:01Z"))).toBe(204); // the next day
  expect(rows()).toHaveLength(FEEDBACK_LIMITS.perSenderPerDay + 2);
});

test("says so when the database isn't set up", async () => {
  expect((await handleFeedback(post(problem), {}, NOW)).status).toBe(503);
});
