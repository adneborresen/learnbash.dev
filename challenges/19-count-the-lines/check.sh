# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
given=$(answer_trimmed)
[ -n "$given" ] || fail "Type the number into the answer box first."
[[ $given =~ ^\+?[0-9]+$ ]] || fail "Enter just the number, without a filename or other text."
given=${given#+}
# Strip leading zeros without arithmetic overflow or octal interpretation.
given="${given#"${given%%[!0]*}"}"
[ -n "$given" ] || given=0

[ "$given" = 500 ] && pass "500 log records. Now you can narrow them down."
fail "Count lines with lowercase -l, not words or bytes."
