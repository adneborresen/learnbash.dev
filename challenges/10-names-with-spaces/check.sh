# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
expected=/run/learnbash/expected
for name in 'Q3 report.txt' 'Q3 report (old).txt'; do
  source=$LEARNER_HOME/reports/$name
  if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" "$expected/$name"; }; then
    fail "A source report is missing or changed. Reset, then copy the current report."
  fi
done
source=$LEARNER_HOME/reports/'Q3 report.txt'
dest=$LEARNER_HOME/backup/'Q3 report.txt'
[ -f "$dest" ] || fail "Save the copy at ~/backup/Q3 report.txt. Quote the name with spaces."
if ! { [ ! -L "$dest" ] && [ ! "$source" -ef "$dest" ]; }; then
  fail "The backup must be an independent copy, not a link."
fi
cmp -s "$dest" "$expected/Q3 report.txt" || fail "The backup contents are wrong. Choose Q3 report.txt, not the old report."
pass "Current report copied; both originals are safe."
