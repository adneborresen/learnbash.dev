# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
orig=$LEARNER_HOME/documents/operations/2026/q4/server-inventory_2026.csv
copy=$LEARNER_HOME/server-inventory_2026.csv
expected=/run/learnbash/expected/server-inventory_2026.csv
if [ ! -f "$orig" ]; then
  [ -f "$copy" ] && fail "The spreadsheet is in your home directory, but it's gone from ~/documents: that's moving, not copying. Press Reset and use cp."
  fail "The original server-inventory_2026.csv is gone. Press Reset to get it back."
fi
if [ -L "$orig" ] || ! cmp -s "$expected" "$orig"; then
  fail "The original server-inventory_2026.csv has changed. Press Reset, then copy it without editing it."
fi
if [ -f "$copy" ]; then
  if [ -L "$copy" ] || [ "$orig" -ef "$copy" ]; then
    fail "~/server-inventory_2026.csv is a link, not an independent copy. Use cp without -l or -s."
  fi
  cmp -s "$expected" "$copy" && pass "Found it! The incident team has its server inventory."
  fail "~/server-inventory_2026.csv isn't the same as the original. Copy it again with cp."
fi
[ -f "$LEARNER_HOME/server-inventory_2025.csv" ] && fail "That's last year's inventory (server-inventory_2025.csv). The incident team needs 2026."
[ -f "$LEARNER_HOME/server-inventory_2026_draft.csv" ] && fail "That's the draft. Look for the file named exactly server-inventory_2026.csv."
fail "There's no server-inventory_2026.csv in your home directory yet."
