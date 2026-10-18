// Runs SQL on the live feedback/usage database (Cloudflare D1) through wrangler,
// which must be logged in to the Cloudflare account (npx wrangler login).
import { execFileSync, execSync } from "node:child_process";

export const DATABASE = "learnbash-feedback";

/** Extra wrangler arguments, e.g. FEEDBACK_WRANGLER_ARGS="--local --config x.toml" to try it locally. */
const where = (process.env.FEEDBACK_WRANGLER_ARGS || "--remote").split(" ").filter(Boolean);

export type Row = Record<string, string | number | null>;

export function query(sql: string): Row[] {
  // On Windows npx is a .cmd script, which only runs through the shell: quote
  // arguments with spaces for it (the SQL here has no double quotes).
  const windows = process.platform === "win32";
  const args = ["--yes", "wrangler@4.147.0", "d1", "execute", DATABASE, ...where, "--json", "--command", sql.replace(/\s+/g, " ")];
  const options = { encoding: "utf8" as const, stdio: ["ignore", "pipe", "pipe"] as Array<"ignore" | "pipe" | "inherit"> };
  let out: string;
  try {
    out = windows
      ? execSync(["npx", ...args.map((a) => (/\s/.test(a) ? `"${a}"` : a))].join(" "), options)
      : execFileSync("npx", args, options);
  } catch (e) {
    // wrangler prints its error as JSON on stdout.
    const stdout = String((e as { stdout?: string }).stdout ?? "");
    const message = /"text":\s*"([^"]*)"/.exec(stdout)?.[1] ?? (e as Error).message;
    // Not logged in: run in the background, wrangler asks for a token instead of offering to log in.
    if (/CLOUDFLARE_API_TOKEN|not logged in|login/i.test(message)) {
      console.error("Not logged in to Cloudflare. Run this once, then try again:\n\n  npx wrangler login\n");
    } else {
      console.error(`wrangler failed: ${message}`);
      const stderr = String((e as { stderr?: string }).stderr ?? "").trim();
      if (stderr) console.error(stderr);
    }
    process.exit(1);
  }
  return (JSON.parse(out) as Array<{ results: Row[] }>)[0].results;
}

/** Whether a table exists yet (the server creates them when the first data arrives). */
export const hasTable = (name: string) =>
  query(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${name.replace(/'/g, "")}'`).length > 0;
