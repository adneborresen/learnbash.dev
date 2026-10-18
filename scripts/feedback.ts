// Shows learner feedback from the live database (Cloudflare D1 "learnbash-feedback").
//   npm run feedback            ratings per challenge and the latest messages
//   npm run feedback -- 100     show the latest 100 messages
// Uses wrangler, logged in to the Cloudflare account (npx wrangler login).
// How far people get: npm run stats.
import { hasTable, query } from "./lib/d1.ts";

const limit = Math.max(1, Math.trunc(Number(process.argv[2] ?? 30)) || 30);

if (!hasTable("feedback")) {
  console.log("No feedback yet.");
  process.exit(0);
}

console.log("Ratings per challenge:");
console.table(
  query(`SELECT challenge,
           SUM(rating = 'up') AS up,
           SUM(rating = 'down') AS down,
           (SELECT COUNT(*) FROM feedback p WHERE p.challenge = f.challenge AND p.kind = 'problem') AS problems
         FROM feedback f WHERE kind = 'rating' GROUP BY challenge ORDER BY down DESC, challenge`),
);

console.log(`\nLatest ${limit} messages:`);
for (const r of query(
  `SELECT created_at, challenge, kind, rating, comment, hints, last_check, device FROM feedback
   WHERE kind != 'rating' ORDER BY id DESC LIMIT ${limit}`,
)) {
  console.log(`\n${r.created_at}  ${r.challenge}  ${r.kind}${r.rating ? ` (${r.rating})` : ""}  ${r.device ?? ""}  hints: ${r.hints ?? "?"}`);
  if (r.last_check) console.log(`  last check: ${r.last_check}`);
  console.log(`  ${String(r.comment).replace(/\n/g, "\n  ")}`);
}
