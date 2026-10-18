# Curriculum

The course specification (parts 1 and 2 implemented; part 3 remains a draft): which challenge teaches what, in which order. How to write
one is in [authoring.md](authoring.md).

## Principles

- **Parts.** The course is split into parts of about 10–15 challenges. Each part has one theme
  targets about an hour, and ends with a review challenge that introduces nothing new.
  Timing still needs testing with beginners.
- **One new idea per challenge.** The `introduces`/`reuses` fields only check prerequisites:
  nothing is used before an earlier challenge introduces it, and nothing is introduced twice.
  Whether a challenge really teaches one idea, and teaches it well, is a judgement made when
  writing it.
- **Practised, not mentioned.** An option that an explanation only mentions in passing (for
  example `grep -c`) is not listed in `introduces`. Later challenges can't count on it.
- **Ids never change.** They are in the URLs and in learners' saved progress. Challenges can
  move between positions and parts.
- **Every commit passes.** A new challenge is added together with the rewrite of the existing
  challenge it takes an idea from, plus its tests. Prerequisites aren't removed in one commit
  and added back in a later one.
- **Fresh machine.** Every challenge starts from a fresh machine in the home folder. Nothing
  carries over from the previous challenge.

## Checker rules

- **What a check can't prove.** It sees the final state, the answer box and what is running in
  the terminal, not which keys were pressed. It can't prove that someone used `less` or `nano`,
  pressed Ctrl+C, or ran a script with `./` rather than another way. The reference solution
  can use a non-interactive command (`cat`, `printf`).
- **Stuck terminal.** Only navigation and prompt-recovery checks require an idle foreground Bash.
  Saved notes may pass with nano open, and reading answers may pass with less open. The checker can see that a command is still running in the terminal
  (`ps … tpgid`, see challenge `find-your-desk`) and say so. A prompt that's back proves
  nothing, because every challenge starts at one: combine it with a real result.
- **Preserved inputs.** When the goal says inputs must stay unchanged, compare them against
  reference copies in `/run/learnbash/expected`. Check contents, not only that a file exists.
- **Format.** The goal says when order matters. Counted output accepts harmless horizontal
  spacing differences, but not missing, repeated or unknown records. Learner-written text
  permits an omitted final newline; extra blank lines and bytes are rejected. Preserved
  inputs are compared byte-for-byte. Numeric answers accept leading zeros. Duplicates stay
  unless the goal asks to remove them.
- **Reviews.** The three hints remind the learner of the outcome (what must exist, what must
  stay unchanged), without command names or syntax.

## Before part 1

The goal in look-around includes the orientation before solving: where to type, Enter,
terminal versus answer box, directory = folder, not typing the prompt, silent success,
Reset, and fresh machines. It asks the learner to practise pwd before ls.

## Part 1: Find your way and work with files

By the end the learner can move around, recover from a wrong turn, read files and
instructions, and safely create and change a small workspace.

† = existing challenge (some are rewritten so that the new challenges before them teach part
of what they used to).

| # | id: title | The one new idea | Check | Wrong results the checker must reject |
|---|---|---|---|---|
| 1 | look-around†: Look around | Where you are and what's there (`pwd`, `ls`) | answer | A folder name; part of the filename |
| 2 | find-your-desk†: Find your desk | Moving through folders with `cd` and relative paths | state | One folder too early; created the folder but stayed elsewhere |
| 3 | back-on-track: Back on track | Recovering with `..`, `~` and absolute paths | state | Still in the wrong branch; went home instead of to the destination |
| 4 | read-the-welcome-note: Read your first note | Reading a short file with `cat` | answer | The filename instead of the code; the outdated note |
| 5 | get-your-prompt-back: Get your prompt back | Cancelling a waiting command with Ctrl+C | answer | `^C`; text typed into the waiting command. While a command still waits, say so |
| 6 | read-the-memo†: Read the memo | Reading and searching a long file in `less` | answer | The old Wi-Fi password; the network name |
| 7 | ask-for-help: Ask the command | Finding an option with `--help` | answer | The message instead of its line number; numbering only nonempty lines |
| 8 | make-room: Make room | Creating a folder with `mkdir` | state | Wrong place; a file with that name |
| 9 | make-a-backup†: Make a backup | Copying files with `cp` | state | An original moved; only one of two copied |
| 10 | names-with-spaces: That name has spaces | Quotes keep a name with spaces together | state | The similarly named decoy copied; the copy missing |
| 11 | leave-a-note: Leave a note | Creating and editing a file in `nano` | state | Not saved; the correction missing or another line damaged |
| 12 | remove-the-junk: Remove the junk | Deleting a file with `rm` | state | Junk still there; an original invoice deleted |
| 13 | rename-and-clean†: Rename and clean up | Renaming and moving with `mv` | state | Copied instead of renamed; the draft deleted |
| 14 | the-interns-logs†: The intern's 300 logs | The shell expands `*` into matching names | state | The notes moved too; some logs left behind |
| 15 | desk-ready: Review: prepare the handover | Nothing new | state | The template moved instead of copied; wrong note; protected draft missing |

Notes:
- **back-on-track:** the destination differs from the home folder, so the untouched start
  fails. It guides the learner into a wrong turn but accepts reaching the destination directly.
- **get-your-prompt-back:** the learner runs `cat` without a filename, gets out, then reads a
  recovery code from a file. Ctrl+D also ends `cat` and is accepted; the hints teach Ctrl+C.
- **leave-a-note:** create a short note, then change one line. It checks the saved contents.
  `nano` uses the Ctrl+O and Ctrl+X buttons on the phone key bar. Physical-phone validation remains a separate check.
- **ask-for-help:** use `cat --help` to discover `-n`; number all lines, including blanks.
  Its help still scrolls on a phone, so teach terminal scrollback in the goal. A correct
  answer obtained by counting manually also passes.
- **Phone controls:** Ctrl+O and Ctrl+X are on the key bar. Saving in nano requires Ctrl+O,
  then Enter to confirm the filename. Browser tests exercise actual save/edit/exit input;
  physical-phone testing is a separate validation, not implied by emulation.
- **Reviews:** desk-ready has a quoted template name, one correction, three logs to move,
  one junk file to remove, and two protected originals. No command hints.
- `touch` waits until timestamps matter. Files are created with the editor here and with
  redirection in part 2.

## Part 2: Investigate an incident

One checkout outage: recover a missing server inventory, inspect the incident evidence,
count and rank it, save the findings, then rehearse a local recovery. The helper does not
deploy a real site. Every exercise independently supplies the required files.

Shared deterministic evidence (consistency checked in tests):

- `logs/app.log`: 500 newline-terminated records, 71 uppercase ERROR lines, 39 lowercase
  error mentions in WARN records; opening status OPEN, final status INVESTIGATING.
- `incident/web-06.log`: the same application evidence; other server logs include ERROR 500
  and a 503 ms warning as decoys.
- `access.log`: 88 requests, with visitor totals 40, 25, 12, 9 and 2. The 25-request visitor
  has the longest consecutive run; the 40-request visitor is the real leader.
- `visit-counts.txt` in top-visitor: unpadded counts, so reverse text sorting gives a
  different answer from numeric ranking. GNU uniq's alignment spaces can otherwise hide
  this distinction for small counts.

| # | id: title | The one new idea | Check | Wrong results the checker must reject |
|---|---|---|---|---|
| 1 | lost-spreadsheet†: The lost spreadsheet | Finding files by name with `find` | state | The draft or previous-year inventory copied; the original moved |
| 2 | first-and-last-lines: Read the beginning and end | Parts of a file with `head` and `tail` | answer | The first status instead of the last; an earlier run's result |
| 3 | which-log-broke†: Which log broke? | Searching inside files with `grep` | answer | The log with ERROR 500; the message instead of the filename |
| 4 | count-the-lines: How long is this log? | Counting lines with `wc -l` | answer | Word count; byte count |
| 5 | how-many-errors†: How many errors? | A pipe sends output into another command | answer | All lines counted; lowercase "error" included |
| 6 | save-the-evidence: Save the evidence | Saving output to a file with `>` | state | Printed but not saved; the source log overwritten |
| 7 | say-it-clearly: Write a status message | Printing text with `echo` | state | The filename as the contents; the wrong path |
| 8 | write-the-report†: Write the report | Appending to the supplied report with `>>` | state | Only the last line left after `>`; the last line added twice |
| 9 | put-lines-in-order: Put matching lines together | `sort` puts identical lines next to each other | state | Duplicates removed; the source overwritten |
| 10 | count-repeat-visits: Count repeat visits | Counting neighbouring repeats with `uniq -c` | state | Separate counts for the same address; addresses without counts |
| 11 | top-visitor†: Top visitor | Ranking numbers, largest first (`sort -nr`) | answer | Reverse text order; the least frequent address |
| 12 | read-the-permissions: Who can do what? | Reading the permissions in `ls -l` | answer | A script others can write; one the owner can't run |
| 13 | run-the-helper: Run the helper | Running a program in the current folder with `./` | state | The script read but not run; an empty result file |
| 14 | permission-denied†: Permission denied | Adding a permission with `chmod u+x` | state | Write access for everyone; the output without the permission |
| 15 | incident-handover: Review: hand over the incident | Nothing new | state | Non-error lines included; wrong counts or ranking |

Notes:
- The old `sort | uniq -c | sort -rn | head` jump is now three steps: put identical lines
  together, count each group from the raw input, then rank a supplied unpadded count table.
  `head` is already known from challenge 2. The final review assembles the full pipeline.
- **say-it-clearly** comes after `>` because its check needs a saved file.
- **run-the-helper:** the script is executable from the start, so running a program comes
  before working out why it's refused. The next challenge uses the same helper with owner
  execute permission missing.
- **write-the-report:** starts with the error records already saved. Append one footer;
  preserve source order and the source log. Rebuilding the correct report also passes.
- **incident-handover:** requires ordered error evidence with one footer and a complete
  numeric visitor ranking; both original logs stay unchanged.
- All repeated source generators remain self-contained in setup.sh. Consistency tests guard
  against drift without introducing an image helper or a content-loader dependency.

## Part 3: Clean a text export (draft)

Built only after parts 1 and 2 have been tried with beginners. Simple text tables with a stated
separator, not general CSV.

| # | id: title | The one new idea |
|---|---|---|
| 1 | spot-the-change: What changed? | Comparing two versions with `diff` |
| 2 | skip-the-header: Keep the records | From a line onwards with `tail -n +2` |
| 3 | pick-a-field: Keep the useful column | Fields with `cut` |
| 4 | match-literal-text: Exactly that text | Literal search (`grep -F`) versus patterns |
| 5 | match-the-whole-line: A complete match | Anchors `^` and `$` |
| 6 | drop-the-noise: Keep everything else | `grep -v` |
| 7 | normalise-case: Make names consistent | `tr` |
| 8 | correct-the-label: Correct the label | `sed` substitution |
| 9 | rank-the-rows: Sort by a field | `sort -k`, with values like 9, 12 and 100 so text order is visibly wrong |
| 10 | one-entry-each: One entry each | Distinct values |
| 11 | either-status: Either status | Alternatives with `grep -E` |
| 12 | clean-handover: Review: deliver a clean export | Nothing new |

## Later parts (order)

- **Exit status before `if`:** success and failure, `&&` and `||`, then `if`.
- **Robust scripts:** first let learners see a script carry on after a failure, then handle
  failures explicitly, then introduce `set -e`, `set -u` and `pipefail` one at a time, each with
  examples of what it doesn't catch (`-e` doesn't stop after a failing `if` condition, or
  a failing command in an `&&`/`||` list other than the last). Arrays, arguments, traps and debugging are more than one part.
- **Processes:** process ids, jobs, signals and cleanup get their own part.
- **Shell rules deepen in stages:** basic quoting in part 1, redirection in part 2, literal
  text versus patterns in part 3; variables and command substitution before `find -exec` and
  `xargs`. Safe filename handling before `xargs`.
- **`awk`** after variables and conditions, clearly separated from Bash syntax.
- **Projects throughout:** every part ends with a review; later ones get longer and less
  specified.
