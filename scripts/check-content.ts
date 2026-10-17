// Validates all challenges and lists TODO-REVIEW markers for expert review.
//   node scripts/check-content.ts          validate (exit 1 on errors)
//   node scripts/check-content.ts --todo   also list TODO-REVIEW markers
import { compileChallenge, findTodoReviews, loadChallenges } from "./lib/challenges.ts";

const { challenges, errors } = loadChallenges();
for (const c of challenges) {
  // Render the Markdown exactly as the website build does.
  const compiled = compileChallenge(c);
  if (/TODO-REVIEW/.test(JSON.stringify(compiled))) errors.push(`challenges/${c.folder}: a TODO-REVIEW note would be visible to learners (put it inside <!-- -->)`);
}
for (const e of errors) console.error(`✘ ${e}`);
console.log(`${challenges.length} valid challenge(s), ${errors.length} error(s)`);

if (process.argv.includes("--todo")) {
  const todos = findTodoReviews();
  console.log(`\n${todos.length} TODO-REVIEW marker(s):`);
  for (const t of todos) console.log(`  ${t.file}:${t.line}  ${t.text}`);
}
process.exit(errors.length > 0 ? 1 : 0);
