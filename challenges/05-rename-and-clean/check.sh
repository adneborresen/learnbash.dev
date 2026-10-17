# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/reports
new=$d/q3-report.txt
if [ -f "$new" ] && grep -q DRAFT "$new"; then
  fail "q3-report.txt contains the draft. It's report_final_FINAL.txt that should be renamed. Press Reset and try again."
fi
for f in report_draft.txt budget.csv; do
  [ -f "$d/$f" ] || fail "Oh no: $f is gone, and rm has no trash bin. Press Reset to get the files back, and only delete junk.tmp."
done
if [ -e "$d/report_final_FINAL.txt" ]; then
  [ -e "$new" ] && fail "There's a q3-report.txt, but report_final_FINAL.txt still exists: that's a copy. Renaming is done with mv."
  fail "report_final_FINAL.txt still has its old name. Rename it with mv."
fi
[ -f "$new" ] || fail "There's no q3-report.txt in ~/reports. Did it end up somewhere else? Check the name with ls."
grep -q "FINAL VERSION" "$new" || fail "q3-report.txt doesn't contain the final report any more. Press Reset and try again."
[ -e "$d/junk.tmp" ] && fail "Renamed! Now delete junk.tmp with rm."
pass "Tidy! The report is renamed and the junk is gone."
