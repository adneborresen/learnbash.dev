# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

source=$LEARNER_HOME/access.log
if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" /run/learnbash/expected/access.log; }; then
  fail "The original access.log changed or is missing. Press Reset and save the result to a different file."
fi

text_equal "$LEARNER_HOME/sorted-visits.txt" /run/learnbash/expected/sorted.txt && pass "All requests sorted, including repeats."
fail "Save all access.log lines in byte order to ~/sorted-visits.txt. Keep duplicate requests."
