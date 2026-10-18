// How far learners get, from the anonymous usage counts (src/feedback/usage.ts).
//   npm run stats          the last 7 days
//   npm run stats -- 30    the last 30 days
// Uses wrangler, logged in to the Cloudflare account (npx wrangler login).
import { loadChallenges } from "./lib/challenges.ts";
import { hasTable, query } from "./lib/d1.ts";

const days = Math.max(1, Math.trunc(Number(process.argv[2] ?? 7)) || 7);
const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);

const rows = hasTable("usage")
  ? query(`SELECT challenge, event, device, SUM(count) AS n FROM usage WHERE day >= '${since}' GROUP BY challenge, event, device`)
  : []; // nothing counted yet
const count = (challenge: string, event: string, device?: string) =>
  rows
    .filter((r) => r.challenge === challenge && r.event === event && (!device || r.device === device))
    .reduce((sum, r) => sum + Number(r.n), 0);

console.log(`Since ${since} (${days} day${days === 1 ? "" : "s"}). "solved" counts each browser once per challenge.\n`);
const { challenges } = loadChallenges();
console.table(
  challenges.map((c) => {
    const opened = count(c.meta.id, "opened");
    const solved = count(c.meta.id, "solved");
    return {
      challenge: c.meta.id,
      opened,
      "on phone": count(c.meta.id, "opened", "phone"),
      started: count(c.meta.id, "started"),
      "load failed": count(c.meta.id, "load-failed"),
      checked: count(c.meta.id, "checked"),
      solved,
      "solved %": opened ? Math.round((100 * solved) / opened) : "",
      "hint 1": count(c.meta.id, "hint-1"),
      "hint 3": count(c.meta.id, "hint-3"),
      resets: count(c.meta.id, "reset"),
    };
  }),
);
