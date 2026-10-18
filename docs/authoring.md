# Writing a challenge

Each challenge is one folder in `challenges/`. Adding a folder is all it takes: no code changes.

```
challenges/
  06-read-the-memo/
    challenge.md      metadata + the text learners read
    setup.sh          prepares the VM (runs as root before the learner gets the prompt)
    check.sh          decides pass/fail (runs as root when the learner presses Check)
    solution.sh       the reference solution, typed into the learner's shell by the tests
    accepted/         optional alternative solutions; every one MUST pass
      absolute-path.sh
      absolute-path.answer
    wrong/            common wrong attempts; every one MUST fail the checker
      outdated-password.sh
      outdated-password.answer
```

The folder name is `NN-id`: `NN` is the position in the course (two digits; gaps are fine) and
`id` must match the `id` in the front matter. A part's challenges are numbered together. Which
challenge goes where is planned in [curriculum.md](curriculum.md).

## challenge.md

```markdown
---
id: read-the-memo
title: Read the memo
module: find-your-way             # the part (an id from src/content/parts.ts)
concept: Reading files            # the ONE new idea
introduces: [cat, less]           # commands/syntax first taught here
reuses: [cd, ls]                  # must be introduced by an earlier challenge
check: answer                     # "state" (inspect the VM) or "answer" (answer box)
answer_label: Wi-Fi password      # answer challenges only
expected_answer: correct-horse    # answer challenges only (used by the tests)
---

## Story
A short scenario.

## Goal
One clear goal.

## Hint 1
A vague nudge.

## Hint 2
Which command to use.

## Hint 3
Nearly the full syntax.

## Explanation
Teach the concept properly. Shown after the challenge is solved.
```

All six `##` sections are required, in this order. Markdown is supported (code blocks, tables,
`<kbd>`). The validator also checks that `reuses` only names things an earlier challenge
`introduces`, so the difficulty curve stays smooth.

**Accuracy:** if you are not 100% sure a statement is true for Bash/GNU tools in general, mark it
with an HTML comment right next to it. It is hidden from learners and listed by
`npm run todo-review` for an expert to check:

```markdown
`sort` orders uppercase before lowercase here. <!-- TODO-REVIEW: true for all locales? -->
```

The same works anywhere in the project: start a comment with the marker (after `#` in
scripts and config files, after `//` in code).

## The environment

The VM runs Alpine Linux with **GNU** bash 5, coreutils, findutils, grep, sed, gawk and less (not
BusyBox), so commands and flags behave like on Ubuntu/Debian. `tests/env.test.ts` enforces this.
One difference to keep in mind: there are no locales, so `sort` and `[a-z]` ranges use plain byte
order (like `LC_ALL=C`). Avoid challenge data where the locale would change the answer.

The learner is user `learner` (home `/home/learner`), with an Ubuntu-like `~/.bashrc` (coloured
`ls`/`grep`). There is no network.

## setup.sh

```bash
# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh     # set -eu, umask 022, $LEARNER_HOME, fix_owner
cd "$LEARNER_HOME" || exit 1
mkdir -p logs
printf 'ERROR 503\n' > logs/app.log
fix_owner                                    # give the files to the learner
```

- Runs as root from a pristine VM on every start and Reset, so it never needs to clean up.
- Must be **deterministic**: the same files every time (the tests verify this). Generate "random"
  data with a fixed seed, e.g. `awk 'BEGIN { srand(42); ... }'`.
- Must finish within 10 seconds (the agent kills it after that).

## check.sh

```bash
# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
[ -f "$LEARNER_HOME/report.txt" ] || fail "There is no ~/report.txt yet."
pass "Report saved!"
```

Exit 0 = pass. The **first line of output** is shown to the learner, so make failures specific
and kind ("3 of 5 files moved", not "wrong"). Helpers from `check-lib.sh`:

| Helper | Use |
|---|---|
| `pass "msg"` / `fail "msg"` | print the message and exit |
| `learner_cwd` | the learner shell's current directory |
| `answer_trimmed` | the answer box content without surrounding whitespace |
| `check_answer EXPECTED [WRONG_MSG] [RIGHT_MSG]` | compare the answer |

Prefer checking the **final state** (files, contents, permissions, current directory) over
guessing which commands were typed.

## solution.sh, accepted/ and wrong/

One command per line, exactly as a learner would type them. Blank lines and `#` comments are
ignored. Don't use interactive programs (`less`, `nano`) or multi-line constructs.

- For `check: answer` challenges, the solution's terminal output must contain `expected_answer`.
- Each wrong attempt is `wrong/NAME.sh` (commands typed) and/or `wrong/NAME.answer` (text typed into
  the answer box; required for answer challenges). Use real mistakes learners make.
- Accepted alternatives use the same format in `accepted/`. Keep valid alternatives here,
  especially regressions for a checker that used to reject a correct solution.
- Answer challenges grade the answer to the supplied exercise, not the commands used to find
  it. A correct answer obtained with another command is not a wrong attempt.
- For state checks, keep reference contents or checksums under `/run/learnbash/expected`
  during setup. This directory is inside the agent's root-only directory, so learner edits
  cannot change the reference. Comparing two learner-editable files is not enough.

## Testing

```sh
npm run check:content                                       # validate all challenges (fast)
npm run lint                                                # shellcheck all scripts
npx vitest run tests/challenges.test.ts -t 06-read-the-memo # prove one challenge in the VM
npm test                                                    # everything
npm run todo-review                                         # list statements awaiting expert review
```

For each challenge the tests check that the starting state fails, the reference solution passes,
every accepted alternative passes, every wrong attempt fails, answers with stray spaces are
accepted, and setup is deterministic.
CI runs all of this; a challenge that fails can't be published.

Try it in the browser with `npm run dev`: the new challenge appears in the list on the home
page and at `http://localhost:5173/challenges/<id>/`. Saving any challenge file reloads the page.
