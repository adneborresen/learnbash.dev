# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
given=$(answer_trimmed)
[ -n "$given" ] || fail "Type the number into the answer box first."
[[ $given =~ ^\+?[0-9]+$ ]] || fail "Enter just the number, without a filename or other text."
given=${given#+}
# Strip leading zeros without arithmetic overflow or octal interpretation.
given="${given#"${given%%[!0]*}"}"
[ -n "$given" ] || given=0

[ "$given" = 7 ] && pass "Line 7: blank lines count too."
[ "$given" = 5 ] && fail "That numbers only nonempty lines. Find the option that numbers all lines."
fail "Read the number beside Owner: Morgan, including blank lines."
