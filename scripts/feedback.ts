// Shows learner feedback from the live database (Cloudflare D1 "learnbash-feedback").
//   npm run feedback            ratings per challenge and the latest messages
//   npm run feedback -- 100     show the latest 100 messages
// Uses wrangler, logged in to the Cloudflare account (npx wrangler login).
import { execFileSync, execSync } from "node:child_process";

const DATABASE = "learnbash-feedback";
const limit = Math.max(1, Math.trunc(Number(process.argv[2] ?? 30)) || 30);

/** Extra wrangler arguments, e.g. FEEDBACK_WRANGLER_ARGS="--local --config x.toml" to try it locally. */
const where = process.env.FEEDBACK_WRANGLER_ARGS?.split(" ").filter(Boolean) ?? ["--remote"];

function query(sql: string): Array<Record<string, string | number | null>> {
  // On Windows npx is a .cmd script, which only runs through the shell: quote
  // arguments with spaces for it (the SQL here has no double quotes).
  const windows = process.platform === "win32";
  const args = ["--yes", "wrangler@4.147.0", "d1", "execute", DATABASE, ...where, "--json", "--command", sql.replace(/\s+/g, " ")];
  const options = { encoding: "utf8" as const, stdio: ["ignore", "pipe", "inherit"] as Array<"ignore" | "pipe" | "inherit"> };
  const out = windows
    ? execSync(["npx", ...args.map((a) => (/\s/.test(a) ? `"${a}"` : a))].join(" "), options)
    : execFileSync("npx", args, options);
  return (JSON.parse(out) as Array<{ results: Array<Record<string, string | number | null>> }>)[0].results;
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
