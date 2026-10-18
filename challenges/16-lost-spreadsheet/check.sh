# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
orig=$LEARNER_HOME/documents/finance/2024/q4/budget_2024.csv
copy=$LEARNER_HOME/budget_2024.csv
expected=/run/learnbash/expected/budget_2024.csv
if [ ! -f "$orig" ]; then
  [ -f "$copy" ] && fail "The spreadsheet is in your home directory, but it's gone from ~/documents: that's moving, not copying. Press Reset and use cp."
  fail "The original budget_2024.csv is gone. Press Reset to get it back."
fi
if [ -L "$orig" ] || ! cmp -s "$expected" "$orig"; then
  fail "The original budget_2024.csv has changed. Press Reset, then copy it without editing it."
fi
if [ -f "$copy" ]; then
  if [ -L "$copy" ] || [ "$orig" -ef "$copy" ]; then
    fail "~/budget_2024.csv is a link, not an independent copy. Use cp without -l or -s."
  fi
  cmp -s "$expected" "$copy" && pass "Found it! The accountant makes the meeting."
  fail "~/budget_2024.csv isn't the same as the original. Copy it again with cp."
fi
[ -f "$LEARNER_HOME/budget_2023.csv" ] && fail "That's last year's budget (budget_2023.csv). The accountant needs 2024."
[ -f "$LEARNER_HOME/budget_2024_draft.csv" ] && fail "That's the draft. Look for the file named exactly budget_2024.csv."
fail "There's no budget_2024.csv in your home directory yet."
