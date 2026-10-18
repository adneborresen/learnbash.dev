# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

text_equal "$LEARNER_HOME/status.txt" /run/learnbash/expected/status.txt && pass "Status message saved."
fail "Save the exact status sentence in ~/status.txt, with no extra lines."
