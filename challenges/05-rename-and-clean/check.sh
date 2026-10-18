# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/reports
new=$d/q3-report.txt
expected=/run/learnbash/expected
if [ -f "$new" ] && grep -q DRAFT "$new"; then
  fail "q3-report.txt contains the draft. It's report_final_FINAL.txt that should be renamed. Press Reset and try again."
fi
for f in report_draft.txt budget.csv; do
  [ -f "$d/$f" ] || fail "Oh no: $f is gone, and rm has no trash bin. Press Reset to get the files back, and only delete junk.tmp."
  if [ -L "$d/$f" ] || ! cmp -s "$expected/$f" "$d/$f"; then
    fail "$f was changed. Leave the draft and budget exactly as they were; press Reset to restore them."
  fi
done
if [ -e "$d/report_final_FINAL.txt" ] || [ -L "$d/report_final_FINAL.txt" ]; then
  [ -e "$new" ] && fail "There's a q3-report.txt, but report_final_FINAL.txt still exists: that's a copy. Renaming is done with mv."
  fail "report_final_FINAL.txt still has its old name. Rename it with mv."
fi
[ -f "$new" ] || fail "There's no q3-report.txt in ~/reports. Did it end up somewhere else? Check the name with ls."
if [ -L "$new" ] || ! cmp -s "$expected/report_final_FINAL.txt" "$new"; then
  fail "q3-report.txt must contain the whole original final report, unchanged. Press Reset and try again."
fi
if [ -e "$d/junk.tmp" ] || [ -L "$d/junk.tmp" ]; then
  fail "Renamed! Now delete junk.tmp with rm."
fi
pass "Tidy! The report is renamed and the junk is gone."
