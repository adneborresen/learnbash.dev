# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh

given=$(answer_trimmed)
[ -n "$given" ] || fail "Type the number into the answer box first."
[[ $given =~ ^\+?[0-9]+$ ]] || fail "Enter just the number, without a filename or other text."
given=${given#+}
# Strip leading zeros without arithmetic overflow or octal interpretation.
given="${given#"${given%%[!0]*}"}"
[ -n "$given" ] || given=0

[ "$given" = 71 ] && pass "71 ERROR lines: the pipe connected searching and counting."
case $given in
  110) fail "That count includes lowercase error in the WARN lines. Search for uppercase ERROR without -i." ;;
  500) fail "That's the whole file. Use grep to select the ERROR lines before counting them." ;;
  497) fail "That's the number of words in the ERROR lines. Use wc -l to count lines, not wc -w." ;;
esac
fail "Count lines containing uppercase ERROR. Include each matching line once."
