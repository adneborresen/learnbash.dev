# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

source=$LEARNER_HOME/logs/app.log
if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" /run/learnbash/expected/app.log; }; then
  fail "The source log changed or is missing. Press Reset, then write to the requested destination."
fi

f=$LEARNER_HOME/report.txt
text_equal "$f" /run/learnbash/expected/report.txt && pass "Report complete: 71 error records and one final marker."
[ -f "$f" ] || fail "The report is missing from ~/report.txt. Reset restores its error records."
text_equal "$f" /run/learnbash/expected/errors.txt && fail "The errors are ready. Append END OF REPORT once with >>."
fail "Keep all 71 errors in source order, followed by exactly one END OF REPORT line. Reset can restore the starting report."
