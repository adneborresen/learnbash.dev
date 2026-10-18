# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
r=$LEARNER_HOME/report.txt
expected=/run/learnbash/expected

if [ ! -f "$r" ]; then
  found=$(find "$LEARNER_HOME" -name report.txt -type f -print -quit)
  [ -n "$found" ] && fail "Found report.txt in ~${found#"$LEARNER_HOME"}, but it should be in your home directory: ~/report.txt."
  fail "There's no ~/report.txt yet."
fi
# Compare bytes: $(cat ...) would hide NULs and extra blank lines at the end.
# Only a missing final newline is fine. The goal doesn't fix the order of the
# ERROR lines, so they are compared sorted (grep | sort also passes).
ends_with_marker() {
  tail -n 1 "$r" | cmp -s - "$expected/end.txt" || tail -n 1 "$r" | cmp -s - "$expected/end-no-newline.txt"
}
same_errors() { LC_ALL=C sort "$@" | cmp -s - "$expected/errors.txt"; }

if ! ends_with_marker; then
  same_errors "$r" && fail "The ERROR lines are there. Now add the last line, END OF REPORT, with >>."
  fail "The last line should be exactly END OF REPORT, with nothing after it (not even a blank line)."
fi
# It ends with the marker; one line in total means that is all there is.
if [ "$(wc -l < "$r")" -le 1 ]; then
  fail "report.txt only contains END OF REPORT. Either the ERROR lines were replaced (a single > replaces a file's contents; use >> to add to the end), or grep found nothing (ERROR is in capitals)."
fi
head -n -1 "$r" | same_errors && pass "Report delivered: 4 errors, properly ended."
head -n -1 "$r" | grep -qx "END OF REPORT" && fail "END OF REPORT appears more than once. Write the file again: the ERROR lines with a single >, then END OF REPORT once with >>."
head -n -1 "$r" | LC_ALL=C sort -u | cmp -s - "$expected/errors.txt" && fail "The ERROR lines appear more than once. Write the file again with a single >, then add END OF REPORT with >>."
fail "report.txt should contain exactly the 4 ERROR lines from ~/logs/app.log, then END OF REPORT. Have a look with cat report.txt."
