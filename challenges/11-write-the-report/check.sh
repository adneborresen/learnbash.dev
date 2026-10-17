# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
r=$LEARNER_HOME/report.txt
errors="2026-10-16 22:31:44 ERROR could not send email to customer 1187
2026-10-16 23:17:30 ERROR payment provider did not answer
2026-10-16 23:41:07 ERROR 503 Service Unavailable (upstream timeout)
2026-10-17 00:03:12 ERROR certificate for shop.example.com expires in 7 days"
end="END OF REPORT"

if [ ! -f "$r" ]; then
  found=$(find "$LEARNER_HOME" -name report.txt -type f -print -quit)
  [ -n "$found" ] && fail "Found report.txt in ~${found#"$LEARNER_HOME"}, but it should be in your home directory: ~/report.txt."
  fail "There's no ~/report.txt yet."
fi
# $(...) drops trailing newlines, so a missing final newline doesn't matter.
content=$(cat "$r")
case $content in
  "$errors"$'\n'"$end") pass "Report delivered: 4 errors, properly ended." ;;
  "$end") fail "report.txt only contains END OF REPORT: the ERROR lines were replaced. A single > replaces a file's contents; use >> to add to the end." ;;
  "$errors") fail "The ERROR lines are there. Now add the last line, END OF REPORT, with >>." ;;
  "$errors"$'\n'*) fail "The ERROR lines are there, but the last line should be exactly END OF REPORT (and nothing after it)." ;;
  "$errors"*"$errors"*) fail "The ERROR lines appear more than once. Write the file again with a single >, then add END OF REPORT with >>." ;;
esac
fail "report.txt should contain exactly the 4 ERROR lines from ~/logs/app.log, then END OF REPORT. Have a look with cat report.txt."
