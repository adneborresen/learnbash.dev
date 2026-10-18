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

text_equal "$LEARNER_HOME/errors.txt" /run/learnbash/expected/errors.txt && pass "Evidence saved; the original log is unchanged."
fail "Save exactly the ERROR lines, in source order, to ~/errors.txt."
